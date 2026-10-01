import { RNG } from '../js/rng.js';
import { createMatch, throwDart, matchResult } from '../js/matchState.js';
import { aiDart, aiSigma } from '../js/throwModel.js';
import { attrsForAverage } from '../js/player.js';
function avgFor(a, sScore, n = 60) {
  const rng = new RNG(7); const sig = { score: sScore, dbl: aiSigma(a).dbl };
  let p = 0, d = 0;
  for (let i = 0; i < n; i++) { const m = createMatch({ legs: 5 }, i % 2); while (!m.done) throwDart(m, aiDart(m, m.turn, a, rng, sig).hit); const r = matchResult(m); for (const s of r.stats) { p += s.points; d += s.darts; } }
  return p / d * 3;
}
const rng = new RNG(3); const out = [];
for (const avg of [40, 50, 60, 70, 80, 90, 100, 110]) {
  const a = attrsForAverage(avg, rng, 0); let lo = 2, hi = 120;
  for (let k = 0; k < 18; k++) { const mid = (lo + hi) / 2; if (avgFor(a, mid) > avg) lo = mid; else hi = mid; }
  out.push(`[${avg}, ${((lo + hi) / 2).toFixed(1)}]`);
}
console.log(out.join(', '));
