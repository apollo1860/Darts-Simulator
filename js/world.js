// KI-Spielwelt (DOM-frei): Aufbau, Lookups, Jahresentwicklung (Ruhestand, Nachwuchs, Form).
import { TOUR_TOP64, TOUR_EXPIRING, TOUR_NEW_2026, CHALLENGE_PLAYERS, DEV_PLAYERS, LOCAL_PLAYERS, QSCHOOL_UK_2026 } from '../data/players.js';
import { NAME_POOLS, POOL_WEIGHTS } from '../data/names.js';
import { attrsForAverage, overall, ratingForAvgExact, EXP_MIN, EXP_MAX } from './player.js';
import { clamp } from './util.js';

export const WORLD_VERSION = 3;   // Rechnen (cal) wird in state.migrate ergänzt
export const DDV_POOL = 63;
export const DEV_MAX_AGE = 23;
export const LOCAL_SHIFT = 6;   // lokale Gegner etwas schwächer als die Listenwerte
const POOL_MAX = 200;          // Spieler ohne Karte (Challenge + Dev)

// tier: tour | challenge | dev | local ; cardUntil = letzte Saison mit gültiger Tourcard
export function createWorld(rng, startYear = 2027) {
  const players = {};
  const add = (rows, prefix, tier, cardUntil) => rows.forEach(([name, nation, age, avg], i) => {
    const id = `${prefix}${i + 1}`;
    players[id] = { id, name, nation, age, avg, tier, cardUntil, attrs: attrsForAverage(avg, rng), exp: aiExp(tier, age, rng) };
  });
  add(TOUR_TOP64, 'T', 'tour', startYear);              // Ende 2026 in den Top 64 → +1 Jahr (bis 2027)
  add(TOUR_EXPIRING, 'X', 'challenge', null);           // Karte Ende 2026 verloren → Q-School
  add(TOUR_NEW_2026, 'N', 'tour', startYear);           // 2-Jahres-Karte 2026/2027
  add(CHALLENGE_PLAYERS, 'C', 'challenge', null);
  add(DEV_PLAYERS, 'D', 'dev', null);
  add(LOCAL_PLAYERS.map(([n, nat, a, avg]) => [n, nat, a, avg - LOCAL_SHIFT]), 'L', 'local', null);
  const world = { version: WORLD_VERSION, players, nextId: 1 };
  addDdvPool(world, rng);
  // Challenge-/Dev-Tour 2026: je Top 2 der Nutzerliste (Listenplatz 1–2) erhalten eine Karte bis Ende 2028
  for (const prefix of ['C', 'D']) {
    [1, 2].map(i => players[prefix + i])
      .forEach(p => { p.tier = 'tour'; p.cardUntil = startYear + 1; });
  }
  for (const p of Object.values(players)) {
    if (p.id[0] === 'T') p.cardVia = `Top 64 PDC ${startYear - 1}`;
    if (p.id[0] === 'N') p.cardVia = +p.id.slice(1) <= 2 ? `Challenge Tour ${startYear - 2}` : +p.id.slice(1) <= 4 ? `Development Tour ${startYear - 2}`
      : `${QSCHOOL_UK_2026.includes(p.name) ? 'Q-School UK' : 'Q-School Europa'} ${startYear - 1}`;
  }
  for (const [pre, label] of [['C', 'Challenge Tour'], ['D', 'Development Tour']]) for (const i of [1, 2]) players[pre + i].cardVia = `${label} ${startYear - 1}`;
  updateTiers({ world });
  return world;
}

export const getPlayer = (state, id) => (id === 'P' ? state.player
  : String(id).startsWith('W:') ? state.qual?.[state.date.year]?.wcTeams?.[id] : state.world.players[id]);
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
  return { tour: 'Tourcard', top: 'Tourcard', challenge: 'Challenge Tour', dev: 'Development Tour', ddv: 'DDV-Rangliste', local: 'Amateur' }[p.tier];
}

// ---- Jahresentwicklung der KI ----
// Erfahrung der KI nach Ebene und Alter (−4 … +10)
export function aiExp(tier, age, rng) {
  const base = { tour: 2 + (age - 20) * 0.35, challenge: (age - 22) * 0.25, dev: -2 + (age - 16) * 0.3,
    ddv: -1 + (age - 18) * 0.12, local: -3 + (age - 18) * 0.1 }[tier] ?? 0;
  return clamp(Math.round(base + rng.normal(0, 1.4)), EXP_MIN, EXP_MAX);
}

// 63 fiktive Spieler der DDV-Ranglistenturniere (Deutschland, ~66–88 Ø)
function addDdvPool(world, rng) {
  const pool = NAME_POOLS.DE, used = new Set(Object.values(world.players).map(p => p.name));
  for (let i = 1; i <= DDV_POOL; i++) {
    let name;
    do name = `${rng.pick(pool.first)} ${rng.pick(pool.last)}`; while (used.has(name));
    used.add(name);
    const avg = Math.round(rng.float(66, 88)), age = rng.int(19, 52);
    world.players[`V${i}`] = { id: `V${i}`, name, nation: 'DE', age, avg, tier: 'ddv', cardUntil: null,
      attrs: attrsForAverage(avg, rng), exp: aiExp('ddv', age, rng) };
  }
}

// Spielstände mit Welt v2 → v3: neue Attribute, Erfahrung, DDV-Pool
export function upgradeWorld(world, rng) {
  for (const p of Object.values(world.players)) { p.attrs = attrsForAverage(p.avg, rng); p.exp = aiExp(p.tier, p.age, rng); }
  addDdvPool(world, rng);
  world.version = WORLD_VERSION;
}

export function changeStrength(p, delta) {
  const before = p.attrs.sco;
  p.avg = clamp(Math.round((p.avg + delta) * 10) / 10, 30, 108);
  const d = ratingForAvgExact(p.avg) - before;
  for (const k of ['fin', 'men', 'foc', 'cal']) p.attrs[k] = clamp(Math.round(p.attrs[k] + d), 1, 100);
  p.attrs.sco = clamp(Math.round((before + d) * 10) / 10, 1, 100);
}

function newTalent(state, rng, year) {
  let r = rng.next(), key = 'EN';
  for (const [k, w] of POOL_WEIGHTS) { if (r < w) { key = k; break; } r -= w; }
  const pool = NAME_POOLS[key];
  const id = `G${state.world.nextId++}`;
  const avg = Math.round(rng.float(74, 86));
  const p = {
    id, name: `${rng.pick(pool.first)} ${rng.pick(pool.last)}`, nation: rng.pick(pool.nations),
    age: rng.int(16, 18), avg, tier: 'dev', cardUntil: null, attrs: attrsForAverage(avg, rng), exp: aiExp('dev', 17, rng), generated: year,
  };
  state.world.players[id] = p;
  return p;
}

// Am Jahresende (vor Alterung): Entwicklung, Ruhestand, Nachwuchs, Dev→Challenge ab 24
export function developWorld(state, rng, year) {
  const report = { retired: [], talents: [] };
  for (const p of Object.values(state.world.players)) {
    if (p.tier === 'local' || p.tier === 'ddv' || p.tier === 'retired') continue;
    const a = p.age;
    if (a < 38 && rng.chance(p.tier === 'tour' ? 0.45 : 0.3)) p.exp = Math.min(EXP_MAX, (p.exp ?? 0) + 1);
    const mean = a <= 20 ? 2.2 : a <= 23 ? 1.4 : a <= 28 ? 0.5 : a <= 34 ? 0 : a <= 40 ? -0.4 : -1;
    changeStrength(p, rng.normal(mean, 1.4));
    // Ruhestand: ab 45 steigend, ohne Tourcard eher
    const pRet = a < 45 ? 0 : (a - 44) * (p.tier === 'tour' ? 0.02 : 0.05);
    if (rng.chance(pRet)) { report.retired.push(p.name); p.tier = 'retired'; p.cardUntil = null; }   // bleibt für Historie erhalten
  }
  // Nachwuchs: jedes Jahr mind. 12 Talente, Dev-Pool (nach dem Altern ≤ 23) bei ~90 halten
  const devNext = () => nonCardPros(state).filter(p => p.age + 1 <= DEV_MAX_AGE).length;
  while ((report.talents.length < 12 || devNext() < 90) && report.talents.length < 40) report.talents.push(newTalent(state, rng, year).name);
  // Pool ohne Karte auf 200 begrenzen: die schwächsten Challenge-Spieler ab 26 hören auf
  const pool = nonCardPros(state);
  if (pool.length > POOL_MAX) pool.filter(p => p.age >= 26 && !p.rival).sort((x, y) => x.avg - y.avg)
    .slice(0, pool.length - POOL_MAX).forEach(p => { p.tier = 'retired'; report.quit = (report.quit ?? 0) + 1; });
  return report;
}

// Nach dem Altern: Dev-Spieler ab 24 → Challenge
export function updateTiers(state) {
  for (const p of nonCardPros(state)) p.tier = p.age <= DEV_MAX_AGE ? 'dev' : 'challenge';
}

export const strength = p => overall(p.attrs);
