// Checkout-Entscheidungen in der DartConnect-Simulation (DOM-frei):
// Gelegentlich (vor einer eigenen Aufnahme auf 41–170) wählt der Spieler den Weg. Rechnen bestimmt,
// wie genau die angezeigten Chancen sind und ob eine Empfehlung erscheint.
import { alternativeRoutes, targetPoint, scoreAt, labelValue, isDoubleLabel, BOGEY } from './board.js';
import { aiSigma } from './throwModel.js';
import { RNG, hashSeed } from './rng.js';
import { perf } from './player.js';
import { clamp } from './util.js';

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
  const routes = alternativeRoutes(rem, 3, 3);
  if (routes.length < 2) return null;
  const p = state.player, a = perf(p);
  const cal = p.attrs.cal ?? 60, noise = (100 - cal) * 0.15;      // Schätzfehler in Prozentpunkten
  const opts = routes.map(route => {
    const real = routeChance(a, rem, route, rng);
    return { route, real, shown: clamp(Math.round(real * 100 + rng.normal(0, noise)), 1, 95) };
  });
  const bestIdx = opts.reduce((bi, o, i) => (o.real > opts[bi].real ? i : bi), 0);
  return { rem, opts, recommended: cal >= 75 ? bestIdx : null, cal };
}

// Gewählten Weg für die nächste eigene Aufnahme festlegen
export function chooseRoute(state, rem, route) {
  const live = state.activeEvent.live;
  live.route = { start: rem, darts: route };
  live.coDec.left--;
}

// Ziel für den i-ten Dart der Aufnahme, solange der Rest zum Plan passt (sonst null → Standardlogik)
export function routeTarget(live, rem, i) {
  const r = live.route;
  if (!r || i >= r.darts.length) return null;
  const expected = r.start - r.darts.slice(0, i).reduce((s, l) => s + labelValue(l), 0);
  return rem === expected ? r.darts[i] : null;
}
