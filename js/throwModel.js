// Wurfmodell (DOM-frei): KI-Würfe (Gauß-Streuung um das Ziel) und Parameter fürs manuelle Zielen
import { targetPoint, scoreAt, suggestTarget, isDoubleLabel } from './board.js';
import { targetAverage, checkoutBase } from './player.js';
import { wouldWinMatch, isDecider, dartsLeft, onDouble } from './matchState.js';
import { clamp } from './util.js';

// Kalibrierung Average → Streuung (mm, je Achse) für Scoring-Darts (ermittelt mit tests/fitSigma.mjs)
const SIGMA_TABLE = [[40, 24.5], [50, 18.2], [60, 14.5], [70, 12.2], [80, 10.1], [90, 8.4], [100, 7.1], [110, 5.8]];
function interp(tab, x) {
  if (x <= tab[0][0]) return tab[0][1];
  for (let i = 1; i < tab.length; i++) {
    if (x <= tab[i][0]) {
      const [x0, y0] = tab[i - 1], [x1, y1] = tab[i];
      return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
    }
  }
  return tab[tab.length - 1][1];
}

// Streuung, bei der ein Doppel-Dart mit Wahrscheinlichkeit p trifft (Doppelring 8 mm × ~52 mm)
const erf = x => { // Abramowitz-Stegun
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return x >= 0 ? y : -y;
};
const pDouble = s => erf(4 / (s * Math.SQRT2)) * erf(26 / (s * Math.SQRT2));
function sigmaForDouble(p) {
  let lo = 1, hi = 80;
  for (let i = 0; i < 30; i++) { const mid = (lo + hi) / 2; if (pDouble(mid) > p) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}

export function aiSigma(attrs) {
  return { score: interp(SIGMA_TABLE, targetAverage(attrs)), dbl: sigmaForDouble(clamp(checkoutBase(attrs), 0.05, 0.8)) };
}

// Druckfaktor (≥1): Entscheidungsleg, Match-Dart, Doppel-Finish – gedämpft durch Nervenstärke
export function pressureFactor(m, i, target, ner) {
  const dbl = isDoubleLabel(target) && onDouble(m.rem[i]);
  const matchDart = dbl && wouldWinMatch(m, i);
  const load = (isDecider(m) ? 0.15 : 0) + (matchDart ? 0.25 : 0) + (dbl ? 0.1 : 0);
  return 1 + load * (1 - ner / 99) * 1.6;
}

// Ausdauer: Leistungsabfall in langen Matches
export const fatigueFactor = (m, sta) => 1 + Math.max(0, m.legIdx - 8) * 0.012 * (1 - sta / 100);

// KI-Dart: Ziel wählen + werfen. Rückgabe {target, x, y, hit}
export function aiDart(m, i, attrs, rng, sig = aiSigma(attrs)) {
  const target = suggestTarget(m.rem[i], dartsLeft(m));
  const p = targetPoint(target);
  const base = isDoubleLabel(target) ? sig.dbl : sig.score;
  const s = base * pressureFactor(m, i, target, attrs.ner) * fatigueFactor(m, attrs.sta);
  const x = p.x + rng.normal(0, s), y = p.y + rng.normal(0, s);
  return { target, x, y, hit: scoreAt(x, y) };
}

// Manuelles Zielen: Amplitude (mm) und Frequenz (Zyklen/s) der Linien + Reststreuung
export function manualParams(attrs, m, i, target) {
  let amp = 66 - 0.48 * attrs.sco;              // Scoring 42 → 46 mm, 95 → 20 mm
  let freq = 0.75 + 0.6 * (1 - attrs.sco / 99);  // Scoring 42 → 1,1 Hz, 95 → 0,77 Hz
  let scatter = 12 - attrs.con * 0.085;          // Konstanz → Zufallsstreuung (mm)
  if (isDoubleLabel(target)) {
    const k = 1.3 - attrs.fin / 200;             // Doppelquote → Genauigkeit auf Doppel
    amp *= k; scatter *= k;
  }
  const pf = pressureFactor(m, i, target, attrs.ner) * fatigueFactor(m, attrs.sta);
  return { amp: amp * pf, freq: freq * Math.sqrt(pf), scatter: scatter * pf, pressure: pf > 1.05 };
}

// Weiche Dreieckskurve in [-1, 1] (Phase in Zyklen)
export function wave(phase) {
  const p = phase - Math.floor(phase);
  const tri = 1 - 4 * Math.abs(((p + 0.25) % 1) - 0.5);
  return 0.75 * tri + 0.25 * Math.sin(2 * Math.PI * p);
}
