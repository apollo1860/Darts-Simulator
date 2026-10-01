// Kalibrierung KI-Dartmodell: node tests/calibDarts.mjs
import { RNG } from '../js/rng.js';
import { createMatch, throwDart, matchResult } from '../js/matchState.js';
import { aiDart, aiSigma } from '../js/throwModel.js';
import { attrsForAverage } from '../js/player.js';
const rng = new RNG(1);
export function playAI(A, B, format, rng) {
  const m = createMatch(format, rng.chance(.5) ? 0 : 1), sig = [aiSigma(A), aiSigma(B)], at = [A, B];
  while (!m.done) { const d = aiDart(m, m.turn, at[m.turn], rng, sig[m.turn]); throwDart(m, d.hit); }
  return matchResult(m);
}
for (const avg of [45, 55, 62, 70, 80, 90, 100, 106]) {
  const a = attrsForAverage(avg, rng, 0);
  let p = 0, d = 0, h = 0, at = 0, s180 = 0, legs = 0;
  for (let i = 0; i < 150; i++) { const r = playAI(a, a, { legs: 6 }, rng); for (const s of r.stats) { p += s.points; d += s.darts; h += s.coHit; at += s.coAtt; s180 += s.s180; } legs += r.legsTotal[0] + r.legsTotal[1]; }
  console.log(avg, 'σ', aiSigma(a).score.toFixed(1), 'σD', aiSigma(a).dbl.toFixed(1), '→ avg', (p / d * 3).toFixed(1), 'co%', (h / at * 100).toFixed(1), '180/leg', (s180 / legs).toFixed(2));
}
