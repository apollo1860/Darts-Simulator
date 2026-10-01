// Checkout-Entscheidungen in der DartConnect-Simulation (DOM-frei):
// Gelegentlich (vor einer eigenen Aufnahme auf 41–170) wählt der Spieler zwischen 3 Wegen. Der Ausgang steht fest:
// der beste Weg (höchste Chance) → Check, der zweite → sauber auf ein Doppel runtergespielt, der dritte → sehr schlechte
// Aufnahme (Nachbarfelder, Bust oder krummer Rest). Rechnen ≥ 75 zeigt den richtigen Weg als Empfehlung.
import { alternativeRoutes, targetPoint, scoreAt, labelValue, isDoubleLabel, BOGEY, ORDER } from './board.js';
import { aiSigma } from './throwModel.js';
import { RNG, hashSeed } from './rng.js';
import { perf } from './player.js';

export const DECISION_CHANCE = 0.3;           // je passender Aufnahme
export const MAX_DECISIONS = 2;               // pro Match

// Monte-Carlo: Chance, mit diesem Weg in dieser Aufnahme zu checken
export function routeChance(attrs, rem, route, rng, n = 400) {
  const sig = aiSigma(attrs);
  let ok = 0;
  for (let i = 0; i < n; i++) {
    let r = rem;
    for (const t of route) {
      const p = targetPoint(t), s = isDoubleLabel(t) ? sig.dbl : sig.score;
      const h = scoreAt(p.x + rng.normal(0, s), p.y + rng.normal(0, s));
      const after = r - h.score;
      if (after < 0 || after === 1 || (after === 0 && !h.double)) break;     // Bust
      r = after;
      if (r === 0) { ok++; break; }
      // weicht der Rest vom Plan ab, wird nur noch der Plan weitergespielt, wenn er noch passt
    }
  }
  return ok / n;
}

// Ist jetzt eine Entscheidung fällig? Rückgabe: Optionen oder null
export function checkoutDecisionDue(state) {
  const inst = state.activeEvent, live = inst?.live;
  if (!live || live.m.done || live.m.turn !== live.me || live.m.visit.darts.length || live.route) return null;
  const rem = live.m.rem[live.me];
  if (rem < 41 || rem > 170 || BOGEY.has(rem)) return null;
  live.coDec ??= { left: MAX_DECISIONS, asked: {} };
  const key = `${live.m.legIdx}-${live.m.stats[live.me].darts}`;
  if (live.coDec.left <= 0 || live.coDec.asked[key]) return null;
  live.coDec.asked[key] = true;
  const rng = new RNG(hashSeed(state.seed, 'co', inst.eventId, inst.current, key));
  if (!rng.chance(DECISION_CHANCE)) return null;
  const p = state.player;
  const opts = buildOptions(rem, perf(p), rng);
  if (!opts) return null;
  const cal = p.attrs.cal ?? 60;
  return { rem, opts, recommended: cal >= 75 ? opts.findIndex(o => o.outcome === 'check') : null, cal };
}

// 3 Wege mit festem Ausgang (Reihenfolge gemischt). null, wenn es keine 3 verschiedenen Wege gibt.
export function buildOptions(rem, attrs, rng) {
  const routes = alternativeRoutes(rem, 3, 3);
  if (routes.length < 3) return null;
  const ranked = routes.map(route => ({ route, real: routeChance(attrs, rem, route, rng) })).sort((x, y) => y.real - x.real);
  const outcomes = ['check', 'setup', 'bad'];
  const opts = ranked.map((o, i) => ({ route: o.route, outcome: outcomes[i], script: scriptFor(rem, o.route, outcomes[i]) }));
  return rng.shuffle(opts);
}

// ---- Skripte: Treffer-Labels der Aufnahme ----
const GOOD_LEAVE = r => r >= 2 && r <= 40 && r % 2 === 0;
const neighbors = n => { const i = ORDER.indexOf(n); return [ORDER[(i + 19) % 20], ORDER[(i + 1) % 20]]; };
// Aufnahme nachspielen: Rest, Bust, Check
export function playScript(rem, script) {
  let r = rem;
  for (const l of script) {
    const v = l === 'OUT' ? 0 : labelValue(l), after = r - v;
    if (after < 0 || after === 1 || (after === 0 && !isDoubleLabel(l))) return { rest: rem, bust: true, checkout: false };
    r = after;
    if (r === 0) return { rest: 0, bust: false, checkout: true };
  }
  return { rest: r, bust: false, checkout: false };
}
function scriptFor(rem, route, outcome) {
  if (outcome === 'check') return [...route];
  if (outcome === 'setup') {
    // alle Stelldarts sitzen, die Darts aufs Doppel landen außerhalb → Rest = das Doppel
    // (bleibt z. B. Bull = 50 stehen, stellt ein Single-Dart noch auf ein gutes Doppel: 50 → S10 → 40)
    const s = route.slice(0, -1);
    const r = playScript(rem, s).rest;
    if (!GOOD_LEAVE(r) && s.length < 3) {
      const n = [10, 18, 20, 9, 14, 17, 2, 6, 4, 8, 12, 16].find(x => GOOD_LEAVE(r - x));
      if (n) s.push(`S${n}`);
    }
    while (s.length < 3) s.push('OUT');
    return s;
  }
  // schlecht: jeder Dart landet im kleineren Nachbar-Single, Doppel/Bull daneben
  const s = route.map(l => {
    if (l === 'BULL' || l === '25') return 'S1';
    if (l[0] === 'D') return 'OUT';
    return `S${Math.min(...neighbors(+l.slice(1)))}`;
  });
  while (s.length < 3) s.push(`S${Math.min(...neighbors(5))}`);
  const res = playScript(rem, s);
  if (!res.bust && (res.checkout || GOOD_LEAVE(res.rest))) s[2] = playScript(rem, [...s.slice(0, 2), 'S1']).checkout ? 'S3' : 'S1';
  return s;
}

// Gewählten Weg für die nächste eigene Aufnahme festlegen (script = feststehende Treffer)
export function chooseRoute(state, rem, route, script = null) {
  const live = state.activeEvent.live;
  live.route = { start: rem, darts: route, script };
  live.coDec.left--;
}

// Skript-Treffer für den i-ten Dart (nur in der Aufnahme, für die der Weg gewählt wurde)
export function scriptedHit(live, visitStart, i) {
  const r = live.route;
  if (!r?.script || r.start !== visitStart || i >= r.script.length) return null;
  const l = r.script[i];
  if (l === 'OUT') return { label: 'OUT', score: 0, mult: 0, num: 0, double: false };
  const p = targetPoint(l);
  return scoreAt(p.x, p.y);
}

// Ziel für den i-ten Dart der Aufnahme, solange der Rest zum Plan passt (sonst null → Standardlogik)
export function routeTarget(live, rem, i) {
  const r = live.route;
  if (!r || i >= r.darts.length) return null;
  const expected = r.start - r.darts.slice(0, i).reduce((s, l) => s + labelValue(l), 0);
  return rem === expected ? r.darts[i] : null;
}
