// New Star Darts (DOM-frei): Spielermodell im NSS-Stil auf Basis der bestehenden Simulation.
// Fähigkeiten 0–60 (Scoring, Finishing, Fokus, Rechnen: 20 Trainingslevel × max. 3 Punkte; Mental = Star-Status, max. 60),
// Star-Status 1–100, Energie 0–100, Sterne-Geld (★, skaliert mit dem Star-Status), Getränke, Beziehungen.
// Die Match-Engine arbeitet weiter mit Perzentil-Attributen → syncAttrs() rechnet Fähigkeiten um.
import { newCareer } from './state.js';
import { addNews } from './news.js';
import { starArticle } from './articles.js';
import { DARTS, STARTER_DART } from '../data/gear.js';
import { setGoals, nameTeam } from './career.js';
import { ANGLE_MIN, ANGLE_MAX, ANGLE_DEFAULT, clampAngle } from './obstruction.js';
import { ratingForAvgExact, START_AGES } from './player.js';
import { TOUR_TOP64, TOUR_EXPIRING, TOUR_NEW_2026, CHALLENGE_PLAYERS, CT_FICTIONAL, DEV_PLAYERS, CT_FORMER, JDC_TALENTS, jdcStartAvg, NATION_FIXES, NAME_FIXES, WOMEN_ON_TOUR, SUPER_LEAGUE, SUPER_LEAGUE_SHIFT, tourSinceStart } from '../data/players.js';
import { SECONDARY } from '../data/secondary.js';
import { rankOf } from './rankings.js';

// Version (Anzeige rechts oben im Titelbildschirm): bei JEDEM Push um 1 erhöhen (Nutzerwunsch)
export const APP_VERSION = 249;
export const SKILL_MAX = 60, SKILL_LEVELS = 20;
export const TRAINABLE = [
  { key: 'sco', label: 'Scoring', icon: '🎯' },
  { key: 'fin', label: 'Finishing', icon: '✔️' },
  { key: 'foc', label: 'Fokus', icon: '🧠' },
  { key: 'cal', label: 'Rechnen', icon: '🧮' },
];
export const SKILLS = [...TRAINABLE, { key: 'men', label: 'Mental', icon: '💪', star: true }];
// Fähigkeit 0 ≈ knapp unter dem schwächsten Tourcard-Holder (Attribut 86,5, Holder ab ~87), 60 = Weltspitze (100)
export const ATTR_BASE = 87.5, ATTR_PER_POINT = 12.5 / 60;
// Version 191 (Nutzerwunsch): Scoring eigene Skala – 0 Punkte = Attribut 83 (Start-Average ≈ 82), 60 Punkte = 100 wie bisher
export const SCO_BASE = 83, SCO_PER_POINT = 17 / 60;
const attrBase = key => (key === 'sco' ? [SCO_BASE, SCO_PER_POINT] : [ATTR_BASE, ATTR_PER_POINT]);
export const STAR_MAX = 100;
// Status-Faktor: Preisgelder UND Preise × (1 + 5 % je Stufe über 1)
export const starFactor = (level = 1) => 1 + 0.05 * (Math.max(1, level) - 1);
// Preise (Ausgaben außer Lifestyle) wachsen stärker als die Einnahmen: +25 % je Stufe (Nutzerwunsch, Version 50);
// ganze ★, aufgerundet (gilt nicht für Getränke – die haben seit Version 78 den eigenen Schlüssel `drinkFactor`, unten)
export const PRICE_STEP = 0.25;
export const priceFactor = (level = 1) => 1 + PRICE_STEP * (Math.max(1, level) - 1);
// Version 106 (Nutzerwunsch): alle mit dem Status wachsenden Preise (Darts, Zubehör/Flights, Geschenke, Ereignis-Kosten, Fitnesstrainer) × 1,25,
// Getränke × 1,25 (Bier bei Status 1 bleibt 1 ★, bei Status 40 150 statt 120 ★). Lifestyle-Preise bleiben fest.
export const PRICE_MULT = 1.25, DRINK_MULT = 1.25;
export const starPrice = (base, level = 1) => Math.max(1, Math.ceil(Math.round(base * priceFactor(level) * PRICE_MULT * 100) / 100));
// Getränke-Preisschlüssel (Version 78, Nutzerwunsch): Bier Status 1 = 1 ★, Status 40 = 120 ★. Bis Status 40 wächst der Faktor geometrisch
// (120^((Stufe−1)/39) ≈ +13,06 % je Stufe; Status 11 ≈ 3,4, 21 ≈ 11,6, 30 ≈ 35), danach +5 % je Stufe (wie die Einnahmen), sonst wären es bei Status 100 > 190.000 ★.
// Gilt nur für Getränke (Bier 1 / Weinschorle 3 / Schnaps 5 Basis-★); alle anderen Preise laufen weiter über `priceFactor`.
export const DRINK_ANCHOR = { level: 40, price: 120 }, DRINK_TAIL = 0.05;
export const drinkFactor = (level = 1) => {
  const L = Math.max(1, level), { level: a, price } = DRINK_ANCHOR;
  return L <= a ? Math.pow(price, (L - 1) / (a - 1)) : price * Math.pow(1 + DRINK_TAIL, L - a);
};
export const START_STARS = 8;      // Startguthaben (★ auf Status 1; Version 167: 8 statt 15)
// Start im Tour-Modus: Saison 2026 direkt nach der Q-School (KW 2)
export const NSD_START = { year: 2026, week: 3 };
// Star-Status-Fortschritt: je Stufe mehr Punkte nötig (Feinabstimmung Etappe 5)
export const starNeed = level => Math.round(100 * Math.pow(1.04, Math.max(1, level) - 1));
export const starPct = p => Math.min(100, ((p.star?.xp ?? 0) / starNeed(p.star?.level ?? 1)) * 100);
export { NSD_BLOCKED } from '../data/tournaments.js';

export const isNsd = state => state?.mode === 'nsd';
export const skillValue = (p, key) => (key === 'men' ? mentalOf(p) : (p.skills?.[key] ?? []).reduce((a, b) => a + b, 0));
export const mentalOf = p => Math.min(SKILL_MAX, p.star?.level ?? 1);
export const skillsAvg = p => SKILLS.reduce((a, s) => a + skillValue(p, s.key), 0) / SKILLS.length;
// Höchstes Level mit mindestens einem Punkt (+1 = nächstes spielbares Level)
export const skillLevel = (p, key) => (p.skills?.[key] ?? []).reduce((hi, v, i) => (v > 0 ? i + 1 : hi), 0);

// Bonus durch Darts (ausgerüstet) und Rausch (Weinschorle/Schnaps, bis Wochenende) – nicht auf Mental
export const gearOf = p => DARTS.find(d => d.id === p.gear?.id) ?? null;
// Zubehör-Boosts (player.boosts = [{id, name, bonus, left}]) gelten für die nächsten eigenen Matches
export const boostBonus = (p, key) => (p.boosts ?? []).reduce((a, b) => a + (b.bonus?.[key] ?? 0), 0);
// Version 243: mitten im Turnier (noch nicht ausgeschieden) – kein Training, keine Beziehungspflege
export const inTournament = state => !!state.activeEvent && !state.activeEvent.done && state.activeEvent.playerAlive !== false;
export const IN_TOURNAMENT_MSG = 'Du bist mitten im Turnier – erst danach wieder möglich';
// Version 219: Kater nach zu viel Alkohol – eine KW lang −20 auf Scoring, Finishing, Fokus, Rechnen (skilltrain.js: drink/soberUp)
export const HANGOVER_MALUS = 20;
export const skillBonus = (p, key) => (key === 'men' ? 0 : (gearOf(p)?.bonus[key] ?? 0) + (p.buzz ?? 0) + boostBonus(p, key) - (p.hangover ? HANGOVER_MALUS : 0));
export const skillEffective = (p, key) => Math.min(SKILL_MAX, skillValue(p, key) + skillBonus(p, key));

// Fähigkeiten (inkl. Bonus) → Attribute der Match-Engine
export function syncAttrs(p) {
  if (!p.skills) return p.attrs;
  for (const s of SKILLS) { const [b, k] = attrBase(s.key); p.attrs[s.key] = Math.round((b + k * skillEffective(p, s.key)) * 10) / 10; }
  return p.attrs;
}

// Version 207 (Nutzerwunsch): Einsteckwinkel umstellen (Training → Winkel) – nur mit voller Energie, kostet 100 %
export const ANGLE_CHANGE_ENERGY = 100;
export function changeAngle(state, angle) {
  const p = state.player, a = Math.round(clampAngle(angle));
  if (a === (p.angle ?? ANGLE_DEFAULT)) throw new Error('Das ist schon dein Winkel.');
  if ((p.energy ?? 0) < ANGLE_CHANGE_ENERGY) throw new Error(`Für die Umstellung brauchst du ${ANGLE_CHANGE_ENERGY} % Energie.`);
  p.angle = a; p.energy = Math.max(0, (p.energy ?? 0) - ANGLE_CHANGE_ENERGY);
  return a;
}
// Fähigkeitspunkte direkt setzen (Einstufung): Punkte auf Level 1
export function setStartSkills(p, points) {
  for (const s of TRAINABLE) {
    const arr = Array(SKILL_LEVELS).fill(0);
    arr[0] = Math.max(0, Math.min(3, points[s.key] ?? 0));
    p.skills[s.key] = arr;
  }
  syncAttrs(p);
}

// Neue Karriere im Tour-Modus: Profil (Vorname, Nachname, Nation, Alter, Wurfhand), Start mit Tourcard
export function newNsdCareer({ first, last, nation, age = 18, hand = 'R', slot = 1, seed, angle = ANGLE_DEFAULT, base = false }) {
  const name = `${first} ${last}`.trim();
  const s = newCareer({ name, nation, hand, age, slot, seed, ...NSD_START });
  s.mode = 'nsd';
  s.news = [];
  const p = s.player, y = s.date.year;
  Object.assign(p, {
    first, last, angle: Math.round(clampAngle(angle)),     // Einsteckwinkel der Darts (obstruction.js)
    tour: 'tour', cardUntil: y + 1, everTourcard: true, cardVia: `Q-School ${y}`, proMatches: 0,
    star: { level: 1, xp: 0 }, energy: 100,
    skills: Object.fromEntries(TRAINABLE.map(t => [t.key, Array(SKILL_LEVELS).fill(0)])),
    drinks: { beer: 0, wine: 0, schnaps: 0 },
    rel: { manager: 0, fans: 10, partner: 0, sponsors: 0 },
    satisfaction: 30, lifestyle: 0,
    gear: { id: STARTER_DART, name: DARTS[0].name }, darts: [STARTER_DART], fitness: null, assessed: false, buzz: 0,
    idle: Object.fromEntries(TRAINABLE.map(t => [t.key, 0])),
  });
  p.exp = Math.max(p.exp ?? 0, 3);    // Tour-Neuling mit Q-School-Erfahrung (KI-Holder liegen meist bei 5–10)
  s.stars = START_STARS;
  // Vorbelegte Ranglisten (€) → Basis-★
  for (const yr of Object.values(s.rankings.years ?? {})) for (const t of Object.values(yr))
    for (const id in t) t[id] = Math.round(t[id] / EUR_PER_STAR * 100) / 100;
  syncAttrs(p);
  setGoals(s);
  nameTeam(s);
  addNews(s, 'info', `Willkommen auf der Tour, ${first}!`,
    `Über die Q-School ${y} hast du deine Tourcard gewonnen – gültig bis Ende ${y + 1}. Auf dem Papier gehörst du zu den Schwächsten. Zeit, das zu ändern.`);
  if (!base) keep128(s);   // realer Spieler: erst nach der Übernahme prüfen
  for (const x of Object.values(s.world.players)) if (x.tier === 'tour') x.tourSince = tourSinceStart(x.name, x.id);   // Version 227: echte Jahre, sonst 0 = „seit spätestens 2025“
  p.tourSince = y; (s.flags ??= {}).v221tour = true;
  return s;
}
// Version 209 (Nutzerwunsch): immer genau 128 Tourcard-Holder – startest du ohne vorhandene KI-Karte (eigener Spieler, realer Spieler
// ohne Tourcard), verliert Stephen Rosney seine Karte (→ Challenge Tour); reicht das nicht, die schwächsten Neu-Holder 2026
export const TOUR_FIELD = 128, DROP_FOR_PLAYER = 'Stephen Rosney';
export function keep128(s) {
  const holders = () => Object.values(s.world.players).filter(x => x.tier === 'tour');
  const extra = () => holders().length + (s.player.tour === 'tour' ? 1 : 0) - TOUR_FIELD;
  const drop = x => { x.tier = x.age <= 23 ? 'dev' : 'challenge'; x.cardUntil = null; x.cardVia = null; };
  const r = holders().find(x => x.name === DROP_FOR_PLAYER);
  if (extra() > 0 && r) drop(r);
  while (extra() > 0) drop(holders().filter(x => x.id.startsWith('N')).sort((a, b) => a.avg - b.avg)[0] ?? holders().sort((a, b) => a.avg - b.avg)[0]);
}

// ---- Reale Spieler (Version 98): Karriere als echter Profi starten ----
// Liste aller echten Spieler der Welt zum Spielstart 2026 (Version 99: auch die Spielerinnen der Women's Series; JDC erst ab 16):
// {name, nation, age (2026), avg (Startwert der Welt), card, group, woman}
export function realPlayers() {
  const out = [], seen = new Set();
  const add = (name0, nation, age, avg, card, group, woman = false, tcYear = null) => {
    const name = NAME_FIXES[name0] ?? name0;
    if (seen.has(name) || (age != null && age < 16)) return;   // Version 161: ohne bekanntes Alter wählbar – Alter frei wählbar (Profil)
    woman ||= WOMEN_ON_TOUR.includes(name); seen.add(name); out.push({ name, nation: NATION_FIXES[name] ?? nation, age, avg, card, group, ...(woman ? { woman } : {}), ...(tcYear ? { tcYear } : {}) });
  };
  for (const [n, nat, a, avg] of TOUR_TOP64) add(n, nat, a - 1, avg, true, 'Tourcard');   // Listen auf Basis 2027
  for (const [n, nat, a, avg] of TOUR_EXPIRING) add(n, nat, a - 1, avg, true, 'Tourcard', false, 2);   // Version 127: zweites Kartenjahr
  for (const [n, nat, a, avg] of TOUR_NEW_2026) add(n, nat, a - 1, avg, true, 'Tourcard', false, 1);   // erstes Kartenjahr
  for (const [n, nat, a, avg] of [...CHALLENGE_PLAYERS.slice(0, -CT_FICTIONAL), ...CT_FORMER]) add(n, nat, a - 1, avg, false, 'Challenge Tour');
  for (const [n, nat, a, avg] of DEV_PLAYERS) add(n, nat, a - 1, avg, false, 'Development Tour');
  for (const [n, nat, a, sl] of SUPER_LEAGUE) add(n, nat, a, sl - SUPER_LEAGUE_SHIFT, false, a <= 23 ? 'Development Tour' : 'Challenge Tour');   // Version 185
  for (const [n, nat, a, lo, hi] of JDC_TALENTS) add(n, nat, a, jdcStartAvg(lo, hi), false, 'JDC-Talent');
  for (const c of Object.values(SECONDARY)) c.players.forEach(([n, nat, a, base], i) => add(n, nat, a, base ?? c.avgTop - i, false, c.label, !!c.woman));
  return out.sort((x, y) => x.name.localeCompare(y.name, 'de'));
}
// Start-Fähigkeiten eines echten Spielers aus seinem Average (Mittelwerte von attrsForAverage, Attribut → Fähigkeit 0–60);
// Mental = Star-Status. Unter Ø ~86 liegt alles bei 0 (wie ein neuer Holder).
const toSkill = (attr, key) => { const [b, k] = attrBase(key); return Math.max(0, Math.min(SKILL_MAX, Math.round((attr - b) / k))); };
// Version 126 (Nutzerwunsch): Spieler ohne Tourcard starten immer bei 0 (Status 1) – nur Tourcard-Holder bekommen Werte aus ihrem Average
export function realStartSkills(avg, card = true) {
  if (!card) return { sco: 0, fin: 0, foc: 0, cal: 0, men: 1 };
  const sco = ratingForAvgExact(avg);
  return { sco: toSkill(sco, 'sco'), fin: toSkill(sco - 1), foc: toSkill(sco - 1), cal: toSkill(sco), men: Math.max(1, toSkill(sco - 2)) };
}
// Version 127 (Nutzerwunsch): erstes Tourcard-Jahr (Neu 2026) → alles 0; zweites Jahr (Karte 2025/2026) → 0–3 nach Stärke innerhalb der Gruppe
const EXP_AVG = TOUR_EXPIRING.map(x => x[3]), EXP_LO = Math.min(...EXP_AVG), EXP_HI = Math.max(...EXP_AVG);
export function realStartFor(r) {
  if (!r.card || r.tcYear === 1) return realStartSkills(r.avg, false);
  if (r.tcYear === 2) { const v = Math.round(3 * (r.avg - EXP_LO) / Math.max(1, EXP_HI - EXP_LO)); return { sco: v, fin: v, foc: v, cal: v, men: Math.max(1, v) }; }
  return realStartSkills(r.avg);
}
const fillSkill = v => Array.from({ length: SKILL_LEVELS }, (_, i) => Math.max(0, Math.min(3, v - 3 * i)));
// ID im Spielstand umbenennen (Ranglisten, Qualifikationen): Schlüssel und Werte
function renameId(o, from, to) {
  if (!o || typeof o !== 'object') return;
  for (const k of Object.keys(o)) {
    const v = o[k];
    if (v && typeof v === 'object') renameId(v, from, to);
    else if (v === from) o[k] = to;
    if (k === from) { o[to] = o[k]; delete o[k]; }
  }
}
export function newRealCareer({ name, hand = 'R', slot = 1, seed, angle = ANGLE_DEFAULT, age = null }) {
  const r = realPlayers().find(x => x.name === name);
  if (!r) throw new Error('Unbekannter Spieler');
  const [first, ...rest] = name.split(' ');
  const own = r.age == null && age != null ? Math.max(START_AGES[0], Math.min(START_AGES[1], Math.round(age))) : null;   // Version 161: Alter selbst gewählt
  const s = newNsdCareer({ first, last: rest.join(' '), nation: r.nation, age: own ?? r.age ?? 30, hand, slot, seed, angle, base: true });
  const p = s.player, y = s.date.year, ai = Object.values(s.world.players).find(x => x.name === name && !x.rival);
  if (ai) { renameId(s.rankings, ai.id, 'P'); renameId(s.qual, ai.id, 'P'); delete s.world.players[ai.id]; p.age = own ?? ai.age; p.exp = Math.max(3, ai.exp ?? 0); }
  // Holder behalten ihre Karte samt Laufzeit; wer ohne Karte startet, bekommt wie ein eigener Spieler eine 2-Jahres-Tourcard (Version 99)
  if (ai?.tier === 'tour') Object.assign(p, { tour: 'tour', cardUntil: ai.cardUntil, cardVia: ai.cardVia ?? `Tourcard ${y}`, tourSince: ai.tourSince ?? tourSinceStart(ai.name, ai.id) });
  if (r.woman) p.woman = true;
  const sk = realStartFor({ ...r, card: ai?.tier === 'tour' || r.card });
  for (const t of TRAINABLE) p.skills[t.key] = fillSkill(sk[t.key]);
  p.star = { level: sk.men, xp: 0 }; p.starSeen = { level: sk.men, xp: 0 };
  p.rel.fans = Math.max(10, Math.min(90, Math.round(10 + 1.6 * (sk.men - 1))));
  s.stars = Math.round(START_STARS * drinkFactor(sk.men));   // gleiche Kaufkraft wie ein Neuling (Getränkepreise wachsen mit dem Status)
  Object.assign(p, { assessed: true, real: name, proMatches: 999 });
  syncAttrs(p);
  s.news = [];
  addNews(s, 'info', `Willkommen, ${name}!`, `Du startest als ${name} in die Saison ${y} – Tourcard bis Ende ${p.cardUntil}.`);
  setGoals(s);
  keep128(s);
  return s;
}

export const relLabel = { manager: 'Manager', fans: 'Fans', partner: 'Freundin', sponsors: 'Sponsoren' };
// Version 100: Spielerinnen haben einen Freund statt einer Freundin – Texte werden beim Anzeigen umgestellt
const MALE_PARTNER = [['Noch keine Freundin', 'Noch kein Freund'], ['Eine Freundin', 'Ein Freund'], ['eine Freundin', 'ein Freund'], ['Deine Freundin', 'Dein Freund'],
  ['deine Freundin', 'dein Freund'], ['deiner Freundin', 'deinem Freund'], ['meiner Freundin', 'meinem Freund'], ['meine Freundin', 'mein Freund'], ['neue Freundin', 'neuer Freund'],
  ['Sie scheint sich', 'Er scheint sich'], ['Sie lacht dich aus und geht zu ihren Freundinnen zurück', 'Er lacht dich aus und geht zu seinen Kumpels zurück'],
  ['sie ist begeistert', 'er ist begeistert'], ['sie hat mich beruhigt', 'er hat mich beruhigt'], ['sonst sieht sie mich nie', 'sonst sieht er mich nie'], ['Freundin', 'Freund']];
export const partnerText = (t, p) => (p?.woman && typeof t === 'string' ? MALE_PARTNER.reduce((s, [a, b]) => s.replaceAll(a, b), t) : t);
export const relLabelOf = (p, k) => (k === 'partner' && p.married ? (p.woman ? 'Ehemann' : 'Ehefrau') : partnerText(relLabel[k], p));   // Version 122: verheiratet

// ---- Sterne-Preisgeld (Basis = Status 1; Auszahlung × starFactor) ----
// Siegprämie je Format; Runden-Anteile wie unten. Gilt im Tour-Modus für alle Spieler (Ranglisten in Basis-★).
export const STAR_PRIZE_WIN = {
  pc: 15, ws: 30, wsf: 100, et: 35, wcod: 100 /* je Team, dein Anteil 50 % */, masters: 100, ukopen: 120,
  wgp: 150, ec: 150, pcf: 130, gsod: 200, matchplay: 225, pln: 10, plf: 350, wm: 1000, challenge: 5, dev: 5, wos: 5, wwm: 10,   // Version 103: Women's Series wie Dev Tour   // Version 94: Youth-WM ohne Preisgeld
};
export const STAR_SHARES = { F: 0.5, SF: 0.25, QF: 0.12, L16: 0.06, L32: 0.04, L64: 0.02, G3: 0.05, G4: 0.025 };
export const EUR_PER_STAR = 1000;   // Umrechnung der vorbelegten Ranglisten (2025/26) beim Karrierestart
// Feste Preistabellen der echten PDC-Events 2026 (Basis-★ = Tsd. £; Sieger siehe STAR_PRIZE_WIN). Gezahlt wird je Runde des Ausscheidens –
// auch für Verlierer der 1. Runde. Fehlender Schlüssel = kein Geld (Players Championship: Letzte 128, UK Open: Letzte 160).
//   ET 230 Tsd. (L64 = Runde 1 „Letzte 48“) · PC 150 je Turnier · Masters 500 (Hauptfeld) · UK Open 750 · Matchplay 1.000 · WGP 750 · EC 750
//   Masters-Vorrunde (Letzte 64/32/16: 0,75/1/2,5) · PC Finals 750 · Grand Slam 1.000 (48 Spieler in 16 Dreiergruppen) · World Cup 500 je Team · WS 100 je Event · WS Finals 450 · WM 5.000 · PL 1.250
const WGP_TABLE = { F: 80, SF: 50, QF: 35, L16: 20, L32: 7.5 };
export const STAR_PRIZE_FIXED = {
  et: { F: 15, SF: 10, QF: 8, L16: 5, L32: 3.5, L64: 2 },
  pc: { F: 10, SF: 6.5, QF: 4, L16: 3, L32: 2, L64: 1.25 },
  ws: { F: 16, SF: 10, QF: 5, L16: 1.75 },
  wsf: { F: 60, SF: 30, QF: 17.5, L16: 10, L32: 5 },
  masters: { F: 50, SF: 30, QF: 17.5, L16: 10, L32: 5 },
  ukopen: { F: 60, SF: 35, QF: 20, L16: 12.5, L32: 7.5, L64: 3, L96: 2, L128: 1.25 },
  matchplay: { F: 125, SF: 65, QF: 35, L16: 22.5, L32: 12.5 },
  wgp: WGP_TABLE, ec: WGP_TABLE,
  pcf: { F: 70, SF: 40, QF: 27.5, L16: 15, L32: 7, L64: 4 },
  gsod: { F: 100, SF: 60, QF: 35, L16: 20, L32: 12.5, G2: 12.5, G3: 5 },   // Version 94: Gruppenzweiter (G2) bekommt den früheren Letzte-32-Betrag
  wcod: { F: 48, SF: 30, QF: 20, L16: 10, G2: 6, G3: 5 },
  wm: { F: 400, SF: 200, QF: 100, L16: 60, L32: 35, L64: 25, L128: 15 },
  plf: { F: 170, SF: 110 },
  mastersq: { L16: 2.5, L32: 1, L64: 0.75 },
  wwm: { F: 5, SF: 2.5, QF: 1.25 },                     // Women's World Matchplay   // Masters-Vorrunde: Geld erst ab der K.-o.-Phase (Letzte 64), Gruppenphase ohne
};
// Premier League: Platz 5–8 der Tabelle (Platz 1–4 spielen die Play-offs: 350/170/110)
export const PL_LEAGUE_PAY = { 5: 95, 6: 90, 7: 85, 8: 80 };
export function starPrizeTable(fmtKey) {
  const W = STAR_PRIZE_WIN[fmtKey];
  if (!W) return STAR_PRIZE_FIXED[fmtKey] ?? {};              // z. B. Masters-Vorrunde: nur feste Beträge ab der K.-o.-Phase
  if (fmtKey === 'pln') return { W };
  if (STAR_PRIZE_FIXED[fmtKey]) return { W, ...STAR_PRIZE_FIXED[fmtKey] };
  const shares = fmtKey === 'ukopen' ? { ...STAR_SHARES, L96: 0.01, L128: 0.005 } : fmtKey === 'wcod' ? { ...STAR_SHARES, G2: 0.04, G3: 0.02 } : STAR_SHARES;   // UK Open: Runde 2/3, World Cup: Gruppe
  return { W, ...Object.fromEntries(Object.entries(shares).map(([k, v]) => [k, Math.round(W * v * 10) / 10])) };
}
// Auszahlung an den Spieler (mind. 1 ★, wenn es überhaupt etwas gibt)
export const starPayout = (base, level) => (base > 0 ? Math.max(1, Math.round(base * starFactor(level))) : 0);
// Anzeige der Ranglisten: so, als hätten alle deinen Status
export const starShow = (base, level) => Math.round(base * starFactor(level));

// ---- Energie (0–100) ----
// Version 63: ein Match kostet deutlich mehr Energie; Version 76: Legs kosten etwas mehr: (3 + 1,0 × Legs) %, höchstens 30 % (vorher 0,8 je Leg, Deckel 25 %). Floor-Turniere (Players Championships, Qualifier,
// Nebentouren) sind mit × 0,75 leichter als Bühne (European Tour, Majors, World Series, Premier League, WM). Vorher 2 + 0,4 × Legs.
export const ENERGY_WEEK = 40, ENERGY_LOW = 20, ENERGY_PER_LEG = 1.0, ENERGY_BASE = 3, ENERGY_CAP = 30, ENERGY_FLOOR = 0.75;
export const FLOOR_CATS = ['pc', 'etq', 'hnq', 'wmreg', 'mastersq', 'wdf', 'challenge', 'dev', 'ddv', 'qschool', 'wos'];
export const isFloor = inst => !!inst && (!!inst.isQualifier || FLOOR_CATS.includes(inst.cat));
export const energyKind = inst => (isFloor(inst) ? ENERGY_FLOOR : 1);
export const matchEnergy = (legs, inst = null) => Math.min(ENERGY_CAP, Math.round((ENERGY_BASE + ENERGY_PER_LEG * legs) * energyKind(inst)));
export const canSelfPlay = p => (p.energy ?? 100) >= ENERGY_LOW;
// Unter 20 %: Malus auf Scoring/Finishing/Fokus, wird im Match mit jedem Leg größer (im Takt des Match-Verbrauchs)
export const energyMalus = (energy, legIdx = 0, kind = 1) => {
  const e = energy - ENERGY_PER_LEG * kind * legIdx;
  return e >= ENERGY_LOW ? 0 : (ENERGY_LOW - e) * 0.9;
};

// ---- Nervosität (Version 63) ----
// Mindert Scoring/Finishing/Mental (Fokus × 0,6) in Attributpunkten – Quellen: Gegner aus den Top 8 der PDC-OOM, Anfängerphase
// (Status 1–5, alle Turniere; −1,2 bei Status 1 bis 0 bei Status 6), große Bühne (Major/World Series/Premier League). Nur über Mental
// auszugleichen: Faktor 1 − Mental/50 → mit jeder Stufe weniger, ab Mental 50 ganz weg.
export const NERVES_TOP8 = 1.5, NERVES_START = 1.2, NERVES_START_LEVELS = 5, NERVES_STAGE = 0.8, NERVES_MENTAL = 50;
export const STAGE_NERVE_CATS = ['major', 'ws', 'pl'];
export const nervesFade = p => Math.max(0, 1 - skillEffective(p, 'men') / NERVES_MENTAL);
export function nervesOf(p, inst, oppId = null) {
  if (!inst || !p.star) return { pts: 0, parts: [] };
  const fade = nervesFade(p), lvl = p.star.level ?? 1, raw = [];
  if (oppId && !inst.teams && (inst.big ?? []).slice(0, 8).includes(oppId)) raw.push(['Gegner aus den Top 8', NERVES_TOP8]);
  if (lvl <= NERVES_START_LEVELS) raw.push(['Anfänger', NERVES_START * (NERVES_START_LEVELS + 1 - lvl) / NERVES_START_LEVELS]);
  if (STAGE_NERVE_CATS.includes(inst.cat) && !inst.isQualifier) raw.push(['große Bühne', NERVES_STAGE]);
  const wm = p.wmMind;                                 // Version 64: Interview mit Elmar Paulke vor der WM (+ Druck / − Ruhe)
  if (inst.fmt === 'wm' && wm?.year === inst.year && wm.nerves) raw.push([wm.nerves > 0 ? 'Druck aus dem Paulke-Interview' : 'Ruhe aus dem Paulke-Interview', wm.nerves]);
  const parts = raw.map(([label, v]) => ({ label, pts: Math.round(v * fade * 100) / 100 })).filter(x => x.pts !== 0);
  return { pts: Math.max(0, Math.round(parts.reduce((a, x) => a + x.pts, 0) * 100) / 100), parts };
}
// Version 83 (Nutzerwunsch): Bei Nervosität ist der Zielkreis in einzelnen Darts zusätzlich größer als beim Dart davor („zittrige Hand“).
// Ab SHAKE_FROM Nervositätspunkten (nervesOf.pts) trifft es jeden Dart mit Chance SHAKE_P × pts (höchstens SHAKE_MAX_P); dann × 1,2 … 1,2 + 0,25 × pts
// (höchstens × 1,8). Mehr Mental → weniger Nervosität → seltener und kleiner; ab Mental 50 gar nicht mehr. Gewürfelt wird einmal je Dart (tournaments.js aimParams).
export const SHAKE_FROM = 0.25, SHAKE_P = 0.18, SHAKE_MAX_P = 0.55, SHAKE_MIN = 1.2, SHAKE_SPREAD = 0.25, SHAKE_MAX = 1.8;
export function nerveShake(pts, rng) {
  if (!(pts >= SHAKE_FROM)) return 1;
  if (!rng.chance(Math.min(SHAKE_MAX_P, SHAKE_P * pts))) return 1;
  return Math.min(SHAKE_MAX, rng.float(SHAKE_MIN, SHAKE_MIN + SHAKE_SPREAD * pts));
}
// Version 113 (Nutzerwunsch): Nervosität macht das Zielkreuz auch schneller – Linien-Tempo × (1 + NERVE_SPEED × pts), höchstens × NERVE_SPEED_MAX
export const NERVE_SPEED = 0.12, NERVE_SPEED_MAX = 1.5;
export const nerveSpeed = pts => (pts > 0 ? Math.min(NERVE_SPEED_MAX, 1 + NERVE_SPEED * pts) : 1);
export function addEnergy(p, n) { p.energy = Math.max(0, Math.min(100, Math.round((p.energy ?? 100) + n))); return p.energy; }

// ---- Star-Status: Fortschritt aus Matches ----
// Sieg auf Status 1 ≈ 12 % des Balkens (Bonus: zu null, hoher Average, stärkerer Gegner, große Bühne). Niederlage: kleiner Abzug.
// Der Balken wächst je Stufe um 3 %, der Gewinn nur linear → jede Stufe dauert länger. Nie unter die erreichte Stufe.
// Version 94: Youth-WM (fmt 'youth') zählt mit eigenem Gewicht – kein Preisgeld, dafür Star-Status
export const STAR_WEIGHT = { youth: 1.3, wwm: 1.0, wos: 0.6, dev: 0.6, pc: 1, etq: 0.8, et: 1.15, ws: 1.2, pl: 1.3, major: 1.4 };
const starScale = level => 1 + 0.01 * (level - 1);   // Gewinn wächst kaum, Balken +3 %/Stufe → jede Stufe deutlich schwerer
// Gegner weit oben in der Order of Merit: mehr Punkte (Platz 1 ×1,6 … ab Platz 100 ×1)
export const rankBonus = rank => 1 + 0.6 * Math.max(0, (100 - (rank ?? 999)) / 99);
export function starMatchDelta(level, { won, my, opp, to, avg, oppStrength = 0, cat, fmt, rating = 5, oppRank = null }) {
  const w = (fmt === 'wm' ? 1.6 : STAR_WEIGHT[fmt === 'youth' || fmt === 'wwm' ? fmt : cat] ?? 1) * starScale(level);
  if (won) {
    let g = 12 * rankBonus(oppRank);
    if (opp === 0) g *= 1.4;
    g *= Math.max(0.75, Math.min(1.4, 1 + (avg - 88) / 40));     // Average
    g *= Math.max(0.85, Math.min(1.5, 1 + oppStrength / 20));    // Gegner stärker (+) / schwächer (−)
    return Math.round(g * w * 10) / 10;
  }
  const close = to > 1 ? Math.min(1, my / (to - 1)) : 0;        // 1 = knapp verloren (Two clear legs: auch über to − 1)
  // Bis Star-Status 10: auch Niederlagen bringen etwas (1–3 % des Balkens), außer Ø unter 85 oder zu null verloren
  if (level <= 10 && avg >= 85 && my > 0) return Math.round(starNeed(level) * (1 + 2 * close) / 100 * 10) / 10;
  // Gute Leistung trotz Niederlage (Note über 6,0): kleines Plus
  if (rating > 6) return Math.round(starNeed(level) * (0.5 + (rating - 6) * 0.5) / 100 * 10) / 10;
  return -Math.round((1 + 3 * (1 - close)) * starScale(level) * 10) / 10;
}
export const STAR_TITLE = 25;   // Turniersieg (× Gewicht)
// Version 131: Major-Titel zählen deutlich mehr – Major ×2,5, World Matchplay ×4, WM ×8 (auf STAR_TITLE × Gewicht)
export const TITLE_MULT = { major: 2.5, matchplay: 4, wm: 8 };
export function titleStarBonus(level, cat, fmt) {
  const w = fmt === 'wm' ? 1.6 : STAR_WEIGHT[fmt === 'youth' || fmt === 'wwm' ? fmt : cat] ?? 1;
  const m = TITLE_MULT[fmt] ?? (cat === 'major' && fmt !== 'youth' ? TITLE_MULT.major : 1);
  return Math.round(STAR_TITLE * w * m * starScale(level) * 10) / 10;
}
// Version 163: ab den Top 16 der PDC-Rangliste wächst der Star-Status langsamer (Top 16 × 0,7, Top 8 × 0,55, Top 3 × 0,45) – nur Gewinne
export const TOP_SLOW = [[3, 0.45], [8, 0.55], [16, 0.7]];
export const topSlow = rank => (rank ? TOP_SLOW.find(([r]) => rank <= r)?.[1] ?? 1 : 1);
export function addStarProgress(state, pts) {
  const p = state.player, st = p.star;
  if (pts > 0 && state.mode === 'nsd') pts *= topSlow(rankOf(state, 'pdc', 'P'));
  let ups = 0;
  st.xp = Math.max(0, Math.round(((st.xp ?? 0) + pts) * 10) / 10);
  while (st.level < STAR_MAX && st.xp >= starNeed(st.level)) { st.xp = Math.round((st.xp - starNeed(st.level)) * 10) / 10; st.level++; ups++; }
  if (st.level >= STAR_MAX) st.xp = 0;
  if (ups) {
    p.freePoints = (p.freePoints ?? 0) + ups;            // je Stufe 1 Fähigkeitspunkt zum Verteilen
    addNews(state, 'star', `⭐ Star-Status ${st.level}!`,
      `${st.level <= SKILL_MAX ? `Mental steigt auf ${mentalOf(p)}. ` : ''}Preisgelder steigen um 5 % je Stufe (jetzt ×${starFactor(st.level).toFixed(2).replace('.', ',')}), Preise um 25 % (jetzt ×${priceFactor(st.level).toFixed(2).replace('.', ',')}). Ein Bier kostet jetzt ${Math.max(1, Math.round(drinkFactor(st.level)))} ★.`);
    syncAttrs(p);
    starArticle(state, st.level);
  }
  return ups;
}

// Freien Fähigkeitspunkt vergeben: nächster fehlender Stern im niedrigsten nicht vollen Level
export function spendSkillPoint(p, key) {
  if (!(p.freePoints > 0)) throw new Error('Keine freien Punkte');
  const arr = p.skills?.[key];
  const i = arr ? arr.findIndex(v => v < 3) : -1;
  if (i < 0) throw new Error('Fähigkeit schon voll');
  arr[i]++; p.freePoints--;
  syncAttrs(p);
  return arr[i];
}

// ---- Match-Note (1–10) und Fans ----
// Wohlwollend: Ø ab 90 oder höherer Ø als der Gegner (auch bei Niederlage) → mind. 6,0
// Version 158: mit steigendem Star-Status strenger – bis Stufe 51 linear: erwarteter Average 85 → 98, erwartete Checkout-Quote
// 33 → 42 %, 180er 0,3 → 0,12 je Stück; die Schutz-Untergrenze 6 gilt erst ab erwartetem Ø + 5.
export const rateRef = (level = 1) => { const t = Math.min(1, (level - 1) / 45); return { avg: 85 + 14 * t, co: 0.33 + 0.1 * t, s180: 0.3 * (1 - 0.65 * t) }; };   // Version 159: minimal strenger (bis Stufe 46: Ø 99, 43 %, 0,105)
export function matchRating({ won, avg, coPct, s180 = 0, my, opp, oppAvg = null, level = 1 }) {
  const ref = rateRef(level);
  let r = 6 + (avg - ref.avg) / 5 + (coPct - ref.co) * 6 + s180 * ref.s180 + (won ? 1 : -0.3) + (my - opp) * 0.1;
  if (avg >= ref.avg + 5 || (oppAvg != null && avg > oppAvg)) r = Math.max(6, r);
  if (won) r = Math.max(5.5, r);
  return Math.round(Math.max(2, Math.min(10, r)) * 10) / 10;
}
// Fans: Zuwachs wird mit vielen Fans kleiner (100 % ist schwer zu erreichen); Verluste voll
export const addFans = (p, n) => addRel(p, 'fans', n > 0 ? Math.round(n * Math.max(0.05, (1 - (p.rel.fans ?? 0) / 100) ** 2) * 10) / 10 : n);
export function addRel(p, key, n) { p.rel[key] = Math.max(0, Math.min(100, (p.rel[key] ?? 0) + n)); return p.rel[key]; }
// Version 159: Fans nach jedem Match: über 7,0 +1 (ab 8,5 +2), 6,1–7,0 ±0, bis 6,0 −1 – Version 160: nach einem Sieg nie ein Verlust
// Version 163: Titel bringen deutlich mehr Fans (gebremst nur mit (1 − Fans/100), nicht quadratisch); WM-Titel: die Hälfte des Abstands zu 100, mind. +15
export const TITLE_FANS = { floor: 3, et: 5, ws: 5, pl: 10, major: 10, matchplay: 14 };   // PL-Spieltag: 1
export function titleFans(p, inst) {
  const f = p.rel.fans ?? 0;
  if (inst.fmt === 'wm') return addRel(p, 'fans', Math.round(Math.max(15, 0.5 * (100 - f)))) - f;
  const n = inst.plNight ? 1 : inst.fmt === 'matchplay' ? TITLE_FANS.matchplay : inst.fmt === 'youth' || inst.fmt === 'wwm' ? TITLE_FANS.et
    : isFloor(inst) ? TITLE_FANS.floor : TITLE_FANS[inst.cat] ?? TITLE_FANS.floor;
  return addRel(p, 'fans', Math.round(n * Math.max(0.15, 1 - f / 100) * 10) / 10) - f;
}
export const fansAfterMatch = (won, rating) => (rating >= 9.5 ? 4 : rating >= 9 ? 3 : rating >= 8 ? 2 : rating > 7 ? 1 : rating > 6 || won ? 0 : -1);   // Version 249: gestaffelt bis +4
// Version 249: Match-Fans gebremst wie addFans ((1 − Fans/100)²), Zuwachs auf der Bühne × 1,5, auf dem Floor × 0,75
export const MATCH_FANS_STAGE = 1.5, MATCH_FANS_FLOOR = 0.75;
export const addMatchFans = (p, n, floor = false) => addFans(p, n > 0 ? n * (floor ? MATCH_FANS_FLOOR : MATCH_FANS_STAGE) : n);
// Version 249: Manager und Sponsoren reagieren auf sehr gute (ab 8,5 +1, ab 9,5 +2) und sehr schwache Niederlagen (bis 4,0 −1)
export const relAfterMatch = (won, rating) => (rating >= 9.5 ? 2 : rating >= 8.5 ? 1 : !won && rating <= 4 ? -1 : 0);

// ---- Editor (Spielstand künstlich anpassen) ----
// Fähigkeit auf Wert v setzen: Level der Reihe nach mit 3 Sternen füllen
export function setSkill(p, key, v) {
  v = Math.max(0, Math.min(SKILL_MAX, Math.round(v)));
  p.skills[key] = Array.from({ length: SKILL_LEVELS }, (_, i) => Math.max(0, Math.min(3, v - 3 * i)));
}
export const EDIT_FIELDS = [
  { key: 'stars', label: 'Sterne-Geld ★', min: 0, max: 1e7, get: s => s.stars ?? 0, set: (s, v) => { s.stars = Math.round(v); } },
  { key: 'level', label: 'Star-Status (Stufe)', min: 1, max: STAR_MAX, get: s => s.player.star.level, set: (s, v) => { s.player.star.level = Math.round(v); s.player.star.xp = 0; s.player.starSeen = null; } },
  { key: 'freePoints', label: 'Freie Fähigkeitspunkte', min: 0, max: 240, get: s => s.player.freePoints ?? 0, set: (s, v) => { s.player.freePoints = Math.round(v); } },
  ...TRAINABLE.map(t => ({ key: `sk_${t.key}`, label: t.label, min: 0, max: SKILL_MAX, get: s => skillValue(s.player, t.key), set: (s, v) => setSkill(s.player, t.key, v) })),
  { key: 'energy', label: 'Energie %', min: 0, max: 100, get: s => s.player.energy ?? 100, set: (s, v) => { s.player.energy = v; } },
  { key: 'satisfaction', label: 'Zufriedenheit', min: 0, max: 100, get: s => s.player.satisfaction ?? 50, set: (s, v) => { s.player.satisfaction = v; } },
  ...Object.entries(relLabel).map(([k, l]) => ({ key: `rel_${k}`, label: `Beziehung ${l}`, min: 0, max: 100, get: s => s.player.rel[k] ?? 0,
    set: (s, v) => { s.player.rel[k] = v; if (k === 'partner' && v > 0) s.player.partnerName ??= 'Lena'; } })),
  { key: 'angle', label: 'Einsteckwinkel (°)', min: ANGLE_MIN, max: ANGLE_MAX, get: s => s.player.angle ?? ANGLE_DEFAULT, set: (s, v) => { s.player.angle = Math.round(v); } },
  { key: 'age', label: 'Alter', min: 16, max: 70, get: s => s.player.age, set: (s, v) => { s.player.age = Math.round(v); } },
  { key: 'cardUntil', label: 'Tourcard bis (Jahr)', min: 2026, max: 2100, get: s => s.player.cardUntil ?? s.date.year, set: (s, v) => { s.player.cardUntil = Math.round(v); s.player.tour = 'tour'; } },
];
export function applyEdits(state, values) {
  for (const f of EDIT_FIELDS) {
    if (!(f.key in values)) continue;
    const v = Number(values[f.key]);
    if (!Number.isFinite(v)) continue;
    f.set(state, Math.max(f.min, Math.min(f.max, v)));
  }
  syncAttrs(state.player);
}
