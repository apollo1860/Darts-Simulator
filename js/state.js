// Spielstand: neue Karriere, Speicher-Slots, Export/Import (DOM-frei bis auf Blob/Download in exportGame)
import { RNG, randomSeed } from './rng.js';
import { startAttrs, ratingForAvg, EXP_MIN, levelFromXp, attrsForAverage, startExp, START_AGES } from './player.js';
import { createWorld, upgradeWorld, WORLD_VERSION, LOCAL_SHIFT, addWeakPool, changeStrength, addSecondary, addJdc, addFormer, addSuperLeague, markWomen, retireSecondaryDupes } from './world.js';
import { LOCAL_PLAYERS, DEV_PLAYERS, DEV_AT_CT_LEVEL, NATION_FIXES, NAME_FIXES, JDC_TALENTS, TOUR_PLAYERS, CHALLENGE_PLAYERS, CT_FICTIONAL, CT_FORMER } from '../data/players.js';
import { SECONDARY } from '../data/secondary.js';
import { scaleSponsorPay, dropSponsor180 } from '../data/sponsorsreal.js';
import { DARTS, STARTER_DART } from '../data/gear.js';
import { createRival } from './rival.js';
import { DEFAULT_REGION } from '../data/regions.js';
import { START_BUDGET, seasonFinance } from './finance.js';
import { addNews } from './news.js';
import { seedRankings, pruneSave, orderOfMerit } from './rankings.js';

export const VERSION = 12;   // v12: New Star Darts (neuer Speicher-Schlüssel, alte Darts-Career-Stände bleiben unberührt)
export const SLOTS = [1, 2, 3];
export const START_YEAR = 2027;
const KEY = n => `newStarDarts.slot.${n}`;

export const emptyStats = () => ({
  matches: 0, wins: 0, legsWon: 0, legsLost: 0, points: 0, darts: 0,
  s180: 0, s140: 0, s100: 0, coHit: 0, coAtt: 0, hiFinish: 0, bestLeg: 0,
  events: 0, titles: 0, finals: 0,
});

export function newCareer({ name, nation, hand, age = 16, region = DEFAULT_REGION, bonus = {}, slot = 1, seed = randomSeed(), year = START_YEAR, week = 1 }) {
  age = Math.max(START_AGES[0], Math.min(START_AGES[1], Math.round(age)));
  const rngState = { s: seed >>> 0 };
  const rng = new RNG(rngState);
  const state = {
    version: VERSION, slot, seed, createdAt: Date.now(), savedAt: 0,
    rng: rngState,
    date: { year, week }, startYear: year,
    player: {
      id: 'P', name, nation, hand, age,
      region: nation === 'DE' ? region : null,
      attrs: startAttrs(bonus), exp: startExp(age), clutch: 0,
      level: 1, xp: 0, xpTotal: 0, pointsEarned: 0, points: 0,
      tour: 'none', cardUntil: null, qschoolYear: null, avgReal: null, everTourcard: false, proMatches: 0,
    },
    world: createWorld(rng, year),
    finance: { balance: START_BUDGET, tx: [], seasons: {}, prizeTotal: 0 },
    week: { played: false, eventId: null },
    activeEvent: null,
    news: [],
    results: [],
    stats: { career: emptyStats(), seasons: {} },
    sponsors: { active: [], offers: [] },
    rankings: { years: {} },
    ended: false,
  };
  seedRankings(state, rng, year);
  createRival(state, rng);
  seasonFinance(state, year);
  seasonStats(state, year);
  state.finance.tx.unshift({ year, week, text: 'Startkapital', amount: START_BUDGET, cat: 'start' });
  addNews(state, 'info', `Willkommen, ${name}!`,
    'Deine Karriere beginnt. Ohne Tourcard bleiben dir vorerst lokale Turniere – sammle Erfahrung und Preisgeld. Die Q-School findet in KW 2 statt.');
  return state;
}

export function seasonStats(state, year) {
  state.stats.seasons[year] ??= emptyStats();
  return state.stats.seasons[year];
}

// ---- Speicher (localStorage) ----
const store = () => (typeof localStorage !== 'undefined' ? localStorage : null);

export function saveGame(state) {
  state.savedAt = Date.now();
  try { store()?.setItem(KEY(state.slot), JSON.stringify(state)); return true; }
  catch (e) { console.error('Speichern fehlgeschlagen', e); return false; }
}

export function loadGame(slot) {
  try {
    const raw = store()?.getItem(KEY(slot));
    return raw ? migrate(JSON.parse(raw)) : null;
  } catch (e) { console.error('Laden fehlgeschlagen', e); return null; }
}

export function deleteSlot(slot) { try { store()?.removeItem(KEY(slot)); } catch { /* egal */ } }

// Kurzinfo je Slot fürs Menü
export function listSlots() {
  return SLOTS.map(slot => {
    const s = loadGame(slot);
    return s ? {
      slot, empty: false, name: s.player.name, nation: s.player.nation, year: s.date.year,
      week: s.date.week, balance: s.finance.balance, savedAt: s.savedAt, ended: s.ended, stars: s.stars ?? 0, star: s.player.star?.level ?? 1,
    } : { slot, empty: true };
  });
}

export function validate(obj) {
  return obj && typeof obj === 'object' && obj.player && obj.date && obj.finance && obj.world && obj.rng;
}

export function migrate(s) {
  // v1/v2 → v3 (Phase 3): echte Spielerwelt, neue Ranglisten-Struktur. Lokale IDs bleiben gleich.
  const freshWorld = (s.world?.version ?? 1) < 2;
  if (freshWorld) {
    s.world = createWorld(new RNG(s.rng), s.date.year);
    s.rankings = { years: {} };
    s.player.cardUntil ??= null; s.player.qschoolYear ??= null;
    delete s.player.tourCardUntil;
    s.activeEvent = null;
  }
  if (!s.rankings.seeded) seedRankings(s, new RNG(s.rng), START_YEAR);   // v3 → v4 (Phase 4)
  if (s.mode === 'nsd' && s.player) {                                   // Version 121: Brass Dart (9 g) immer im Besitz, ohne Darts → ausgerüstet
    const p = s.player; p.darts ??= [];
    if (!p.darts.includes(STARTER_DART)) p.darts.unshift(STARTER_DART);
    if (!p.gear) p.gear = { id: STARTER_DART, name: DARTS.find(d => d.id === STARTER_DART).name };
  }
  s.rankings.exact ??= s.date.year + 1;   // Version 62: Turnier-Aufzeichnung für das exakte Auslaufen der 2-Jahres-OOM beginnt im Folgejahr (ältere Spielstände laufen bis dahin linear)
  // v4 → v5: Perzentil-Attribute (Scoring, Finishing, Mental, Fokus), Erfahrung, Bundesland, DDV
  if (s.world.version < WORLD_VERSION) upgradeWorld(s.world, new RNG(s.rng));
  const p = s.player;
  if (p.attrs.con !== undefined) {
    const old = p.attrs, r = v => ratingForAvg(30 + 0.77 * v);
    p.attrs = { sco: r(old.sco), fin: r(old.fin), men: r(old.ner), foc: r(old.con) };
    p.exp = EXP_MIN; p.clutch = 0;
    s.activeEvent = null;
  }
  p.region ??= p.nation === 'DE' ? DEFAULT_REGION : null;
  // v5 → v6: Attribut Rechnen (Spieler 60, KI ≈ Scoring-Niveau), Training
  if (p.attrs.cal === undefined) {
    p.attrs.cal = 60;
    const r = new RNG(s.rng);
    for (const x of Object.values(s.world.players)) x.attrs.cal ??= Math.max(1, Math.min(100, Math.round(r.normal(x.attrs.sco, 4))));
  }
  // v6 → v7: Level-System (Level aus Gesamt-XP; bereits verdiente Punkte bleiben)
  if (p.level === undefined) Object.assign(p, levelFromXp(p.xpTotal ?? 0));
  // v7 → v8: lokale Gegner um LOCAL_SHIFT Ø schwächer
  if ((s.version ?? 1) < 8 && !freshWorld) {
    const r = new RNG(s.rng);
    for (const x of Object.values(s.world.players)) if (x.tier === 'local') { x.avg -= LOCAL_SHIFT; x.attrs = attrsForAverage(x.avg, r); }
  }
  // v8 → v9: lokale Gegner nur noch Deutsche (Namen/Nation aus der Liste, Stärke bleibt)
  if ((s.version ?? 1) < 9) LOCAL_PLAYERS.forEach(([name, nation], i) => {
    const x = s.world.players[`L${i + 1}`];
    if (x) { x.name = name; x.nation = nation; }
  });
  // v9 → v10: Rivale
  if (!s.rival) createRival(s);
  // v10 → v11: Dev Tour schwächer (−4 Ø, außer CT-Listen-Spieler), schwacher fiktiver Pool für CT/Dev
  if ((s.version ?? 1) < 11 && !freshWorld) {
    const r = new RNG(s.rng), keep = new Set(DEV_AT_CT_LEVEL), devNames = new Set(DEV_PLAYERS.map(x => x[0]));
    for (const x of Object.values(s.world.players))
      if (x.id[0] === 'D' && devNames.has(x.name) && !keep.has(x.name) && x.tier !== 'tour') changeStrength(x, -4);
    if (!s.world.players.F1) addWeakPool(s.world, r);
  }
  // Nebentour-Pools (S…) für ältere Stände nachrüsten
  addSecondary(s.world.players, new RNG(s.rng), s.date.year);
  // Version 101: Noa-Lynn van Leuven → Challenge Tour, Spielerinnen mit Average der Nutzer-Rangliste
  if ((s.womenV ?? 0) < 101) {
    const r = new RNG(s.rng), wl = new Map(SECONDARY.women.players.map(x => [x[0], x]));
    for (const x of Object.values(s.world.players)) {
      if (x.name === 'Noa-Lynn van Leuven' && x.tier === 'secondary') { delete x.circuit; delete x.woman; x.tier = x.age <= 23 ? 'dev' : 'challenge'; x.avg = 85; x.attrs = attrsForAverage(85, r); }
      const w = x.tier === 'secondary' && x.circuit === 'women' && wl.get(x.name);
      if (w) { x.nation = w[1]; x.avg = w[3]; x.attrs = attrsForAverage(w[3], r); }
    }
    s.womenV = 101;
  }
  // Version 162: Spielerinnen mit Average-Spanne (Silvia Lindner 52–75) auch in bestehenden Spielständen
  for (const [circuit, c] of Object.entries(SECONDARY)) for (const [n, nat, , base, range] of c.players) if (range) for (const x of Object.values(s.world.players))   // Version 182: alle Nebentouren
    if (x.name === n && x.circuit === circuit && !x.avgRange) { x.avgRange = range; x.avg = base; x.nation = nat; x.attrs = attrsForAverage(base, new RNG(s.rng)); }
  if ((s.asiaV ?? 0) < 183) {   // Version 183: Asian Tour mit Nutzer-Averages auch in bestehenden Spielständen
    const al = new Map(SECONDARY.asia.players.map(r => [r[0], r]));
    for (const x of Object.values(s.world.players)) { const r = x.circuit === 'asia' && x.tier === 'secondary' && al.get(x.name); if (r) { x.nation = r[1]; x.avg = r[3]; x.attrs = attrsForAverage(r[3], new RNG(s.rng)); } }
    s.asiaV = 183;
  }
  addFormer(s.world.players, new RNG(s.rng), s.date.year);   // Version 96
  addSuperLeague(s.world.players, new RNG(s.rng), s.date.year);   // Version 185
  markWomen(s.world.players);
  retireSecondaryDupes(s.world.players);   // Version 181
  for (const x of Object.values(s.world.players)) { if (NAME_FIXES[x.name]) x.name = NAME_FIXES[x.name]; if (NATION_FIXES[x.name]) x.nation = NATION_FIXES[x.name]; }
  // Version 95: geprüfter Spielerpool (Nutzerliste, Stichtag 01.01.2026) – Nation und Alter echter Spieler auch in bestehenden Spielständen
  if ((s.poolV ?? 0) < 97) {   // Version 97: + ehemalige Holder (Alterskorrekturen)
    const pool = new Map();
    for (const [n, nat, a] of [...TOUR_PLAYERS, ...CHALLENGE_PLAYERS.slice(0, -CT_FICTIONAL), ...DEV_PLAYERS, ...CT_FORMER]) if (typeof a === 'number') pool.set(n, [nat, a - 1]);   // Listenalter auf Basis 2027
    for (const [n, nat, a] of JDC_TALENTS) pool.set(n, [nat, a]);
    for (const c of Object.values(SECONDARY)) for (const [n, nat, a] of c.players) if (typeof a === 'number') pool.set(n, [nat, a]);
    for (const x of Object.values(s.world.players)) {
      const v = !x.rival && pool.get(x.name);
      if (v) { x.nation = v[0]; x.age = v[1] + (s.date.year - 2026); if (x.tier === 'challenge' && x.age <= 23) x.tier = 'dev'; }
    }
    s.poolV = 97;
  }
  // Version 94: JDC-Talente – vorhandener Lewis Cook (Dev-Liste) bekommt sein Potenzial, fehlende Talente ab 16 kommen dazu
  for (const x of Object.values(s.world.players)) { const j = JDC_TALENTS.find(t => t[0] === x.name); if (j && !x.potential) { x.potential = j[4]; x.jdc = true; } }
  { const have = new Set(Object.values(s.world.players).map(x => x.name)), keep = {};
    for (const [id, x] of Object.entries(s.world.players)) if (/^J\d+$/.test(id)) keep[id] = x;
    JDC_TALENTS.forEach(([name], i) => { if (have.has(name) && !keep[`J${i + 1}`]) keep[`J${i + 1}`] = { skip: true }; });   // schon unter anderer ID vorhanden
    const tmp = { ...keep }; addJdc(tmp, new RNG(s.rng), s.date.year);
    for (const [id, x] of Object.entries(tmp)) if (!keep[id]) s.world.players[id] = x; }   // Nationen korrigiert (Version 69/88, Nutzerhinweise: `NATION_FIXES`)
  if (typeof s.stars === 'number') s.stars = Math.round(s.stars);   // ★ nur ganze Zahlen
  scaleSponsorPay(s);                                                // Version 93/142: Sponsorbeträge × 0,7 bzw. 0,56 (laufende Verträge einmalig)
  dropSponsor180(s);                                                 // Version 143: keine 180er-Prämie mehr
  s.version = VERSION;
  if (s.mode === 'nsd') pruneSave(s);   // Version 163: alte Jahre aus großen Spielständen entfernen
  if (s.mode === 'nsd') lateTop64Cards(s);   // Version 200
  return s;
}
// Version 200: Jahreswechsel lief noch nach alter Regel (vor Version 199) → Spieler ohne Karte, die zum Saisonende in den Top 64 der
// PDC-OOM standen (z. B. nach einer starken WM als Qualifikant), bekommen ihre Tourcard nachträglich (gültig bis Ende Folgejahr)
function lateTop64Cards(s) {
  const f = (s.flags ??= {}), y = s.date.year;
  if (f.v200cards || y <= 2026) { f.v200cards = true; return; }
  f.v200cards = true;
  for (const x of orderOfMerit(s, 'pdc', y - 1).slice(0, 64)) {
    const pl = x.p, holder = pl.id === 'P' ? s.player.tour === 'tour' : pl.tier === 'tour';
    if (holder || x.money <= 0 || pl.tier === 'retired') continue;
    const via = `Top 64 PDC ${y - 1} (Platz ${x.rank})`;
    if (pl.id === 'P') Object.assign(s.player, { tour: 'tour', cardUntil: y + 1, everTourcard: true, cardVia: via });
    else Object.assign(pl, { tier: 'tour', cardUntil: y + 1, cardVia: via });
    (s.news ??= []).unshift({ year: y, week: s.date.week, type: pl.id === 'P' ? 'result' : 'info', title: `🎫 Tourcard nachgereicht: ${pl.id === 'P' ? s.player.name : pl.name}`,
      text: `Platz ${x.rank} der PDC Order of Merit zum Saisonende ${y - 1} – Spieler ohne Karte in den Top 64 bekommen eine Tourcard (gültig bis Ende ${y + 1}).`, read: false });
  }
}

export function exportGame(state) {
  const blob = new Blob([JSON.stringify(state, null, 1)], { type: 'application/json' });
  const a = document.createElement('a');
  const safe = state.player.name.replace(/[^\wäöüÄÖÜß-]+/g, '_');
  a.href = URL.createObjectURL(blob);
  a.download = `darts-career_${safe}_${state.date.year}-KW${state.date.week}.json`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

export async function importGame(file, slot) {
  const obj = JSON.parse(await file.text());
  if (!validate(obj)) throw new Error('Ungültige Spielstand-Datei');
  obj.slot = slot;
  return migrate(obj);
}
