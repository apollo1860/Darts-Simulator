// Spielstand: neue Karriere, Speicher-Slots, Export/Import (DOM-frei bis auf Blob/Download in exportGame)
import { RNG, randomSeed } from './rng.js';
import { startAttrs, ratingForAvg, EXP_MIN } from './player.js';
import { createWorld, upgradeWorld, WORLD_VERSION } from './world.js';
import { DEFAULT_REGION } from '../data/regions.js';
import { START_BUDGET, seasonFinance } from './finance.js';
import { addNews } from './news.js';
import { seedRankings } from './rankings.js';

export const VERSION = 6;
export const SLOTS = [1, 2, 3];
export const START_YEAR = 2027;
const KEY = n => `dartsCareer.slot.${n}`;

export const emptyStats = () => ({
  matches: 0, wins: 0, legsWon: 0, legsLost: 0, points: 0, darts: 0,
  s180: 0, s140: 0, s100: 0, coHit: 0, coAtt: 0, hiFinish: 0, bestLeg: 0,
  events: 0, titles: 0, finals: 0,
});

export function newCareer({ name, nation, hand, region = DEFAULT_REGION, bonus = {}, slot = 1, seed = randomSeed() }) {
  const rngState = { s: seed >>> 0 };
  const rng = new RNG(rngState);
  const state = {
    version: VERSION, slot, seed, createdAt: Date.now(), savedAt: 0,
    rng: rngState,
    date: { year: START_YEAR, week: 1 },
    player: {
      id: 'P', name, nation, hand, age: 18,
      region: nation === 'DE' ? region : null,
      attrs: startAttrs(bonus), exp: EXP_MIN, clutch: 0,
      xp: 0, xpTotal: 0, pointsEarned: 0, points: 0,
      tour: 'none', cardUntil: null, qschoolYear: null, avgReal: null, everTourcard: false,
    },
    world: createWorld(rng),
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
  seedRankings(state, rng, START_YEAR);
  seasonFinance(state, START_YEAR);
  seasonStats(state, START_YEAR);
  state.finance.tx.unshift({ year: START_YEAR, week: 1, text: 'Startkapital', amount: START_BUDGET, cat: 'start' });
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
      week: s.date.week, balance: s.finance.balance, savedAt: s.savedAt, ended: s.ended,
    } : { slot, empty: true };
  });
}

export function validate(obj) {
  return obj && typeof obj === 'object' && obj.player && obj.date && obj.finance && obj.world && obj.rng;
}

export function migrate(s) {
  // v1/v2 → v3 (Phase 3): echte Spielerwelt, neue Ranglisten-Struktur. Lokale IDs bleiben gleich.
  if ((s.world?.version ?? 1) < 2) {
    s.world = createWorld(new RNG(s.rng), s.date.year);
    s.rankings = { years: {} };
    s.player.cardUntil ??= null; s.player.qschoolYear ??= null;
    delete s.player.tourCardUntil;
    s.activeEvent = null;
  }
  if (!s.rankings.seeded) seedRankings(s, new RNG(s.rng), START_YEAR);   // v3 → v4 (Phase 4)
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
  s.version = VERSION;
  return s;
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
