// KI-Spielwelt (DOM-frei): Aufbau, Lookups, Jahresentwicklung (Ruhestand, Nachwuchs, Form).
import { TOUR_TOP64, TOUR_EXPIRING, TOUR_NEW_2026, CHALLENGE_PLAYERS, DEV_PLAYERS, LOCAL_PLAYERS, QSCHOOL_UK_2026, CT_FICTIONAL } from '../data/players.js';
import { NAME_POOLS, POOL_WEIGHTS, randomName } from '../data/names.js';
import { attrsForAverage, overall, ratingForAvgExact, EXP_MIN, EXP_MAX } from './player.js';
import { clamp } from './util.js';
import { RNG, hashSeed } from './rng.js';

export const WORLD_VERSION = 3;   // Rechnen (cal) wird in state.migrate ergänzt
export const DDV_POOL = 63;
export const DEV_MAX_AGE = 23;
export const LOCAL_SHIFT = 6;   // lokale Gegner etwas schwächer als die Listenwerte
const POOL_MAX = 300;          // Spieler ohne Karte (Challenge + Dev, inkl. schwacher Pool)

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
  // Fiktive Spieler (lokale Amateure, fiktive CT-Spieler): Namen je Karriere zufällig aus Vor-/Nachnamen der Nation
  const used = new Set(Object.values(players).filter(p => p.id[0] !== 'L').map(p => p.name));
  const fictional = [...Object.values(players).filter(p => p.id[0] === 'L'),
    ...Array.from({ length: CT_FICTIONAL }, (_, i) => players[`C${CHALLENGE_PLAYERS.length - CT_FICTIONAL + i + 1}`])];
  for (const p of fictional) used.delete(p.name);
  for (const p of fictional) p.name = randomName(rng, p.nation, used);
  addDdvPool(world, rng);
  addWeakPool(world, rng);
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
  const used = new Set(Object.values(world.players).map(p => p.name));
  for (let i = 1; i <= DDV_POOL; i++) {
    const name = randomName(rng, 'DE', used);
    const avg = Math.round(rng.float(66, 88)), age = rng.int(19, 52);
    world.players[`V${i}`] = { id: `V${i}`, name, nation: 'DE', age, avg, tier: 'ddv', cardUntil: null,
      attrs: attrsForAverage(avg, rng), exp: aiExp('ddv', age, rng) };
  }
}

// Schwache fiktive Spieler aus ganz Europa für die Auslosung von CT/Dev Tour (F1…F90):
// 50 Dev (16–22 J., 64–72 Ø), 40 Challenge (24–48 J., 68–75 Ø) – „Kanonenfutter“ der ersten Runden
export const WEAK_DEV = 50, WEAK_CT = 40;
export function addWeakPool(world, rng) {
  const used = new Set(Object.values(world.players).map(p => p.name));
  for (let i = 1; i <= WEAK_DEV + WEAK_CT; i++) {
    const dev = i <= WEAK_DEV;
    const nation = randomNation(rng), name = randomName(rng, nation, used);
    const avg = Math.round(dev ? rng.float(64, 72) : rng.float(68, 75)), age = dev ? rng.int(16, 22) : rng.int(24, 48);
    const tier = dev ? 'dev' : 'challenge';
    world.players[`F${i}`] = { id: `F${i}`, name, nation, age, avg, tier, cardUntil: null,
      attrs: attrsForAverage(avg, rng), exp: aiExp(tier, age, rng) };
  }
}

// Spielstände mit Welt v2 → v3: neue Attribute, Erfahrung, DDV-Pool
export function upgradeWorld(world, rng) {
  for (const p of Object.values(world.players)) { p.attrs = attrsForAverage(p.avg, rng); p.exp = aiExp(p.tier, p.age, rng); }
  addDdvPool(world, rng);
  world.version = WORLD_VERSION;
}

// Fiktive Amateure (tier 'amateur', IDs A…) für Qualifier mit zu wenigen Spielern (HNQ, Nordic & Baltic, Osteuropa):
// bewusst nicht zu stark (Ø 58–72), spielen nur diese Qualifier; Zufall fest je Nation + Zähler (verändert state.rng nicht)
export const AMATEUR_AVG = [58, 72];
// woman = true: fiktive Spielerin (Women's Series), nur im Frauen-Qualifier
export function addAmateurs(state, nation, n, woman = false) {
  const w = state.world, used = new Set(Object.values(w.players).map(p => p.name)), out = [];
  for (let i = 0; i < n; i++) {
    const no = (w.nextAmateur ??= 1), rng = new RNG({ s: hashSeed(`amateur|${state.seed}|${nation}|${no}|${woman}`) });   // je Karriere anders
    w.nextAmateur++;
    const name = randomName(rng, nation, used, woman);
    const avg = Math.round(rng.float(...AMATEUR_AVG) * 10) / 10, age = rng.int(18, 50);
    w.players[`A${no}`] = { id: `A${no}`, name, nation, age, avg, tier: 'amateur', cardUntil: null, attrs: attrsForAverage(avg, rng), exp: aiExp('ddv', age, rng), ...(woman ? { woman: true } : {}) };
    out.push(w.players[`A${no}`]);
  }
  return out;
}

// Nation für generierte Spieler: Namensraum nach Gewicht (EN 45 %, NL 22 %, DE 18 %, Rest Europa), dann Nation daraus
function randomNation(rng) {
  let r = rng.next(), key = 'EN';
  for (const [k, w] of POOL_WEIGHTS) { if (r < w) { key = k; break; } r -= w; }
  return rng.pick(NAME_POOLS[key].nations);
}

export function changeStrength(p, delta) {
  const before = p.attrs.sco;
  p.avg = clamp(Math.round((p.avg + delta) * 10) / 10, 30, 108);
  const d = ratingForAvgExact(p.avg) - before;
  for (const k of ['fin', 'men', 'foc', 'cal']) p.attrs[k] = clamp(Math.round(p.attrs[k] + d), 1, 100);
  p.attrs.sco = clamp(Math.round((before + d) * 10) / 10, 1, 100);
}

function newTalent(state, rng, year) {
  const nation = randomNation(rng), used = new Set(Object.values(state.world.players).map(p => p.name));
  const id = `G${state.world.nextId++}`;
  const avg = Math.round(rng.float(70, 82));          // Dev-Niveau (unter der Challenge Tour)
  const p = {
    id, name: randomName(rng, nation, used), nation,
    age: rng.int(16, 18), avg, tier: 'dev', cardUntil: null, attrs: attrsForAverage(avg, rng), exp: aiExp('dev', 17, rng), generated: year,
  };
  state.world.players[id] = p;
  return p;
}

// Am Jahresende (vor Alterung): Entwicklung, Ruhestand, Nachwuchs, Dev→Challenge ab 24
export function developWorld(state, rng, year) {
  const report = { retired: [], talents: [] };
  for (const p of Object.values(state.world.players)) {
    if (p.tier === 'local' || p.tier === 'ddv' || p.tier === 'amateur' || p.tier === 'retired') continue;
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
