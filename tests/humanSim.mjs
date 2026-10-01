// Simuliert einen menschlichen Spieler im manuellen Modus (Reaktionsfehler ~N(0, ms)) → erwarteter Average
import { RNG } from '../js/rng.js';
import { createMatch, throwDart, matchResult } from '../js/matchState.js';
import { manualParams, wave } from '../js/throwModel.js';
import { targetPoint, scoreAt, suggestTarget } from '../js/board.js';
import { dartsLeft } from '../js/matchState.js';
const rng = new RNG(5), ms = +(process.argv[2] || 50);
// Stopp: Mensch zielt auf Nulldurchgang; Fehler = Reaktionszeit × Geschwindigkeit der Welle
function stopOffset(amp, freq) {
  const ph = 0.5 + rng.normal(0, ms / 1000) * freq; // Nulldurchgang bei Phase 0.5 (abwärts) bzw. 0
  return amp * wave(ph);
}
for (const v of [42, 55, 70, 85, 95]) {
  const a = { sco: v, fin: v, con: v, ner: v, sta: v };
  let p = 0, d = 0, h = 0, at = 0;
  for (let i = 0; i < 60; i++) {
    const m = createMatch({ legs: 3 }, 0);
    while (!m.done) {
      const t = suggestTarget(m.rem[m.turn], dartsLeft(m)), tp = targetPoint(t), mp = manualParams(a, m, m.turn, t);
      const x = tp.x + stopOffset(mp.amp, mp.freq) + rng.normal(0, mp.scatter), y = tp.y + stopOffset(mp.amp, mp.freq * 1.13) + rng.normal(0, mp.scatter);
      throwDart(m, scoreAt(x, y));
    }
    const r = matchResult(m); for (const s of r.stats) { p += s.points; d += s.darts; h += s.coHit; at += s.coAtt; }
  }
  console.log(`Attribute ${v}: Average ${(p / d * 3).toFixed(1)}, Checkout ${(h / at * 100).toFixed(0)} %`);
}
