// New Star Darts (DOM-frei): Spielermodell im NSS-Stil auf Basis der bestehenden Simulation.
// Fähigkeiten 0–60 (Scoring, Finishing, Fokus, Rechnen: 20 Trainingslevel × max. 3 Punkte; Mental = Star-Status, max. 60),
// Star-Status 1–100, Energie 0–100, Sterne-Geld (★, skaliert mit dem Star-Status), Getränke, Beziehungen.
// Die Match-Engine arbeitet weiter mit Perzentil-Attributen → syncAttrs() rechnet Fähigkeiten um.
import { newCareer } from './state.js';
import { addNews } from './news.js';
import { starArticle } from './articles.js';
import { DARTS } from '../data/gear.js';
import { setGoals, nameTeam } from './career.js';

// Version (Anzeige rechts oben im Titelbildschirm): bei JEDEM Push um 1 erhöhen (Nutzerwunsch)
export const APP_VERSION = 34;
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
export const STAR_MAX = 100;
// Status-Faktor: Preisgelder UND Preise × (1 + 5 % je Stufe über 1)
export const starFactor = (level = 1) => 1 + 0.05 * (Math.max(1, level) - 1);
// Preise in ganzen ★, ab Stufe 2 aufgerundet (+5 %/Stufe): Bier Stufe 1 = 1 ★, ab Stufe 2 = 2 ★
export const starPrice = (base, level = 1) => Math.max(1, Math.ceil(Math.round(base * starFactor(level) * 100) / 100));
export const START_STARS = 15;     // Startguthaben (★ auf Status 1)
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

// Bonus durch Darts (ausgerüstet) und Rausch (Schnaps/Wodka, bis Wochenende) – nicht auf Mental
export const gearOf = p => DARTS.find(d => d.id === p.gear?.id) ?? null;
// Zubehör-Boosts (player.boosts = [{id, name, bonus, left}]) gelten für die nächsten eigenen Matches
export const boostBonus = (p, key) => (p.boosts ?? []).reduce((a, b) => a + (b.bonus?.[key] ?? 0), 0);
export const skillBonus = (p, key) => (key === 'men' ? 0 : (gearOf(p)?.bonus[key] ?? 0) + (p.buzz ?? 0) + boostBonus(p, key));
export const skillEffective = (p, key) => Math.min(SKILL_MAX, skillValue(p, key) + skillBonus(p, key));

// Fähigkeiten (inkl. Bonus) → Attribute der Match-Engine
export function syncAttrs(p) {
  if (!p.skills) return p.attrs;
  for (const s of SKILLS) p.attrs[s.key] = Math.round((ATTR_BASE + ATTR_PER_POINT * skillEffective(p, s.key)) * 10) / 10;
  return p.attrs;
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
export function newNsdCareer({ first, last, nation, age = 18, hand = 'R', slot = 1, seed }) {
  const name = `${first} ${last}`.trim();
  const s = newCareer({ name, nation, hand, age, slot, seed, ...NSD_START });
  s.mode = 'nsd';
  s.news = [];
  const p = s.player, y = s.date.year;
  Object.assign(p, {
    first, last,
    tour: 'tour', cardUntil: y + 1, everTourcard: true, cardVia: `Q-School ${y}`, proMatches: 0,
    star: { level: 1, xp: 0 }, energy: 100,
    skills: Object.fromEntries(TRAINABLE.map(t => [t.key, Array(SKILL_LEVELS).fill(0)])),
    drinks: { beer: 0, schnaps: 0, wodka: 0 },
    rel: { manager: 0, fans: 10, partner: 0, sponsors: 0 },
    satisfaction: 30, lifestyle: 0,
    gear: null, darts: [], fitness: null, assessed: false, buzz: 0,
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
  return s;
}

export const relLabel = { manager: 'Manager', fans: 'Fans', partner: 'Freundin', sponsors: 'Sponsoren' };

// ---- Sterne-Preisgeld (Basis = Status 1; Auszahlung × starFactor) ----
// Siegprämie je Format; Runden-Anteile wie unten. Gilt im Tour-Modus für alle Spieler (Ranglisten in Basis-★).
export const STAR_PRIZE_WIN = {
  pc: 20, ws: 30, wsf: 50, et: 40, wcod: 120 /* je Team, dein Anteil 50 % */, masters: 100, ukopen: 120,
  wgp: 150, ec: 150, pcf: 150, gsod: 200, matchplay: 250, pln: 15, plf: 250, wm: 500, youth: 10, challenge: 5, dev: 5,
};
export const STAR_SHARES = { F: 0.5, SF: 0.25, QF: 0.12, L16: 0.06, L32: 0.04, L64: 0.02, G3: 0.05, G4: 0.025 };
export const EUR_PER_STAR = 1000;   // Umrechnung der vorbelegten Ranglisten (2025/26) beim Karrierestart
export function starPrizeTable(fmtKey) {
  const W = STAR_PRIZE_WIN[fmtKey];
  if (!W) return {};
  if (fmtKey === 'pln') return { W };
  const shares = fmtKey === 'ukopen' ? { ...STAR_SHARES, L96: 0.01, L128: 0.005 } : fmtKey === 'wcod' ? { ...STAR_SHARES, G2: 0.04, G3: 0.02 } : STAR_SHARES;   // UK Open: Runde 2/3, World Cup: Gruppe
  return { W, ...Object.fromEntries(Object.entries(shares).map(([k, v]) => [k, Math.round(W * v * 10) / 10])) };
}
// Auszahlung an den Spieler (mind. 1 ★, wenn es überhaupt etwas gibt)
export const starPayout = (base, level) => (base > 0 ? Math.max(1, Math.round(base * starFactor(level))) : 0);
// Anzeige der Ranglisten: so, als hätten alle deinen Status
export const starShow = (base, level) => Math.round(base * starFactor(level));

// ---- Energie (0–100) ----
export const ENERGY_WEEK = 40, ENERGY_LOW = 20, ENERGY_PER_LEG = 0.4;
export const matchEnergy = legs => Math.round(2 + ENERGY_PER_LEG * legs);
export const canSelfPlay = p => (p.energy ?? 100) >= ENERGY_LOW;
// Unter 20 %: Malus auf Scoring/Finishing/Fokus, wird im Match mit jedem Leg größer
export const energyMalus = (energy, legIdx = 0) => {
  const e = energy - ENERGY_PER_LEG * legIdx;
  return e >= ENERGY_LOW ? 0 : (ENERGY_LOW - e) * 0.9;
};
export function addEnergy(p, n) { p.energy = Math.max(0, Math.min(100, Math.round((p.energy ?? 100) + n))); return p.energy; }

// ---- Star-Status: Fortschritt aus Matches ----
// Sieg auf Status 1 ≈ 12 % des Balkens (Bonus: zu null, hoher Average, stärkerer Gegner, große Bühne). Niederlage: kleiner Abzug.
// Der Balken wächst je Stufe um 3 %, der Gewinn nur linear → jede Stufe dauert länger. Nie unter die erreichte Stufe.
export const STAR_WEIGHT = { pc: 1, etq: 0.8, et: 1.15, ws: 1.2, pl: 1.3, major: 1.4 };
const starScale = level => 1 + 0.01 * (level - 1);   // Gewinn wächst kaum, Balken +3 %/Stufe → jede Stufe deutlich schwerer
// Gegner weit oben in der Order of Merit: mehr Punkte (Platz 1 ×1,6 … ab Platz 100 ×1)
export const rankBonus = rank => 1 + 0.6 * Math.max(0, (100 - (rank ?? 999)) / 99);
export function starMatchDelta(level, { won, my, opp, to, avg, oppStrength = 0, cat, fmt, rating = 5, oppRank = null }) {
  const w = (fmt === 'wm' ? 1.6 : STAR_WEIGHT[cat] ?? 1) * starScale(level);
  if (won) {
    let g = 12 * rankBonus(oppRank);
    if (opp === 0) g *= 1.4;
    g *= Math.max(0.75, Math.min(1.4, 1 + (avg - 88) / 40));     // Average
    g *= Math.max(0.85, Math.min(1.5, 1 + oppStrength / 20));    // Gegner stärker (+) / schwächer (−)
    return Math.round(g * w * 10) / 10;
  }
  const close = to > 1 ? my / (to - 1) : 0;                      // 1 = knapp verloren
  // Bis Star-Status 10: auch Niederlagen bringen etwas (1–3 % des Balkens), außer Ø unter 85 oder zu null verloren
  if (level <= 10 && avg >= 85 && my > 0) return Math.round(starNeed(level) * (1 + 2 * close) / 100 * 10) / 10;
  // Gute Leistung trotz Niederlage (Note über 6,0): kleines Plus
  if (rating > 6) return Math.round(starNeed(level) * (0.5 + (rating - 6) * 0.5) / 100 * 10) / 10;
  return -Math.round((1 + 3 * (1 - close)) * starScale(level) * 10) / 10;
}
export const STAR_TITLE = 25;   // Turniersieg (× Gewicht)
export function addStarProgress(state, pts) {
  const p = state.player, st = p.star;
  let ups = 0;
  st.xp = Math.max(0, Math.round(((st.xp ?? 0) + pts) * 10) / 10);
  while (st.level < STAR_MAX && st.xp >= starNeed(st.level)) { st.xp = Math.round((st.xp - starNeed(st.level)) * 10) / 10; st.level++; ups++; }
  if (st.level >= STAR_MAX) st.xp = 0;
  if (ups) {
    p.freePoints = (p.freePoints ?? 0) + ups;            // je Stufe 1 Fähigkeitspunkt zum Verteilen
    addNews(state, 'star', `⭐ Star-Status ${st.level}!`,
      `${st.level <= SKILL_MAX ? `Mental steigt auf ${mentalOf(p)}. ` : ''}Preisgelder und Preise steigen um 5 % je Stufe (jetzt ×${starFactor(st.level).toFixed(2).replace('.', ',')}).`);
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
export function matchRating({ won, avg, coPct, s180 = 0, my, opp, oppAvg = null }) {
  let r = 6 + (avg - 85) / 5 + (coPct - 0.33) * 6 + s180 * 0.3 + (won ? 1 : -0.3) + (my - opp) * 0.1;
  if (avg >= 90 || (oppAvg != null && avg > oppAvg)) r = Math.max(6, r);
  if (won) r = Math.max(5.5, r);
  return Math.round(Math.max(2, Math.min(10, r)) * 10) / 10;
}
// Fans: Zuwachs wird mit vielen Fans kleiner (100 % ist schwer zu erreichen); Verluste voll
export const addFans = (p, n) => addRel(p, 'fans', n > 0 ? Math.round(n * Math.max(0.05, (1 - (p.rel.fans ?? 0) / 100) ** 2) * 10) / 10 : n);
export function addRel(p, key, n) { p.rel[key] = Math.max(0, Math.min(100, (p.rel[key] ?? 0) + n)); return p.rel[key]; }
export const fansAfterMatch = (won, rating) => (won ? (rating >= 6 ? 1 : 0) + (rating >= 8.5 ? 1 : 0) : rating < 4 ? -1 : 0);

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
