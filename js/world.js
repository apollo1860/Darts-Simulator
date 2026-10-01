// KI-Spielwelt (DOM-frei): Aufbau, Lookups, Jahresentwicklung (Ruhestand, Nachwuchs, Form).
import { TOUR_TOP64, TOUR_EXPIRING, TOUR_NEW_2026, CHALLENGE_PLAYERS, DEV_PLAYERS, LOCAL_PLAYERS } from '../data/players.js';
import { NAME_POOLS, POOL_WEIGHTS } from '../data/names.js';
import { attrsForAverage, targetAverage, overall } from './player.js';
import { clamp } from './util.js';

export const WORLD_VERSION = 2;
export const DEV_MAX_AGE = 23;

// tier: tour | challenge | dev | local ; cardUntil = letzte Saison mit gültiger Tourcard
export function createWorld(rng, startYear = 2027) {
  const players = {};
  const add = (rows, prefix, tier, cardUntil) => rows.forEach(([name, nation, age, avg], i) => {
    const id = `${prefix}${i + 1}`;
    players[id] = { id, name, nation, age, avg, tier, cardUntil, attrs: attrsForAverage(avg, rng) };
  });
  add(TOUR_TOP64, 'T', 'tour', startYear + 1);          // Ende 2026 als Top 64 verlängert
  add(TOUR_EXPIRING, 'X', 'challenge', null);           // Karte Ende 2026 verloren → Q-School
  add(TOUR_NEW_2026, 'N', 'tour', startYear);           // 2-Jahres-Karte 2026/2027
  add(CHALLENGE_PLAYERS, 'C', 'challenge', null);
  add(DEV_PLAYERS, 'D', 'dev', null);
  add(LOCAL_PLAYERS, 'L', 'local', null);
  const world = { version: WORLD_VERSION, players, nextId: 1 };
  // Challenge-/Dev-Tour 2026: je Top 2 (hier: die Stärksten) erhalten eine Karte bis Ende 2028
  for (const tier of ['challenge', 'dev']) {
    Object.values(players).filter(p => p.tier === tier)
      .sort((a, b) => b.avg - a.avg).slice(0, 2)
      .forEach(p => { p.tier = 'tour'; p.cardUntil = startYear + 1; });
  }
  updateTiers({ world });
  return world;
}

export const getPlayer = (state, id) => (id === 'P' ? state.player : state.world.players[id]);
export const playersOfTier = (state, ...tiers) =>
  Object.values(state.world.players).filter(p => tiers.includes(p.tier));
// Ohne Tourcard, aber im Profi-Unterbau (Challenge/Dev)
export const nonCardPros = state => playersOfTier(state, 'challenge', 'dev');
export const hasCard = (p, year) => p.tier === 'tour' || (p.id === 'P' && p.tour === 'tour' && p.cardUntil >= year);

export function tourStatus(p, year = p.qschoolYear) {
  if (p.id === 'P') {
    if (p.tour === 'tour') return `Tourcard${p.cardUntil ? ` bis ${p.cardUntil}` : ''}`;
    if (year && p.qschoolYear === year) return p.age <= DEV_MAX_AGE ? 'Challenge + Dev Tour' : 'Challenge Tour';
    return 'Amateur';
  }
  return { tour: 'Tourcard', top: 'Tourcard', challenge: 'Challenge Tour', dev: 'Development Tour', local: 'Amateur' }[p.tier];
}

// ---- Jahresentwicklung der KI ----
function changeStrength(p, delta) {
  const d = delta / 0.77;
  for (const k of Object.keys(p.attrs)) p.attrs[k] = clamp(Math.round(p.attrs[k] + d * (k === 'sco' ? 1 : 0.8)), 1, 99);
  p.avg = Math.round(targetAverage(p.attrs) * 10) / 10;
}

function newTalent(state, rng, year) {
  let r = rng.next(), key = 'EN';
  for (const [k, w] of POOL_WEIGHTS) { if (r < w) { key = k; break; } r -= w; }
  const pool = NAME_POOLS[key];
  const id = `G${state.world.nextId++}`;
  const avg = Math.round(rng.float(74, 86));
  const p = {
    id, name: `${rng.pick(pool.first)} ${rng.pick(pool.last)}`, nation: rng.pick(pool.nations),
    age: rng.int(16, 18), avg, tier: 'dev', cardUntil: null, attrs: attrsForAverage(avg, rng), generated: year,
  };
  state.world.players[id] = p;
  return p;
}

// Am Jahresende (vor Alterung): Entwicklung, Ruhestand, Nachwuchs, Dev→Challenge ab 24
export function developWorld(state, rng, year) {
  const report = { retired: [], talents: [] };
  for (const p of Object.values(state.world.players)) {
    if (p.tier === 'local') continue;
    const a = p.age;
    const mean = a <= 20 ? 2.2 : a <= 23 ? 1.4 : a <= 28 ? 0.5 : a <= 34 ? 0 : a <= 40 ? -0.4 : -1;
    changeStrength(p, rng.normal(mean, 1.4));
    // Ruhestand: ab 45 steigend, ohne Tourcard eher
    const pRet = a < 45 ? 0 : (a - 44) * (p.tier === 'tour' ? 0.02 : 0.05);
    if (rng.chance(pRet)) { report.retired.push(p.name); delete state.world.players[p.id]; }
  }
  // Pool ohne Karte bei ~100 halten (Nachwuchs rückt nach)
  const target = 100;
  while (nonCardPros(state).length < target) report.talents.push(newTalent(state, rng, year).name);
  return report;
}

// Nach dem Altern: Dev-Spieler ab 24 → Challenge
export function updateTiers(state) {
  for (const p of nonCardPros(state)) p.tier = p.age <= DEV_MAX_AGE ? 'dev' : 'challenge';
}

export const strength = p => overall(p.attrs);
