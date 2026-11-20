// Wurfmodell (DOM-frei): KI-Würfe (Gauß-Streuung um das Ziel) und Parameter fürs manuelle Zielen
import { targetPoint, scoreAt, suggestTarget, isDoubleLabel, labelValue, BOGEY, PLAN_CE } from './board.js';
import { targetAverage, checkoutBase, calcError } from './player.js';
import { wouldWinMatch, isDecider, dartsLeft, onDouble, needsIn } from './matchState.js';
import { clamp } from './util.js';
import { blockage, stability, SWITCH_AT, BLOCK_SIGMA, BOUNCE_P, BOUNCER, bounceChance, robinChance, ROBIN, deflect } from './obstruction.js';

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

// Druckfaktor (Streuungs-Multiplikator): Entscheidungsleg, Match-Dart, Doppel-Finish – gedämpft durch Mental,
// Erfahrung (−4 … +10) wirkt in Clutch-Momenten: negativ = Matchdarts wackeln, positiv = eiskalt
export function pressureFactor(m, i, target, men, exp = 0) {
  const dbl = isDoubleLabel(target) && onDouble(m.rem[i]);
  const matchDart = dbl && wouldWinMatch(m, i);
  const load = (isDecider(m) ? 0.15 : 0) + (matchDart ? 0.25 : 0) + (dbl ? 0.1 : 0);
  const clutch = matchDart ? 1 - 0.025 * exp : isDecider(m) ? 1 - 0.006 * exp : 1;
  return (1 + load * (1 - men / 100) * 1.6) * clutch;
}

// Ausdauer: Leistungsabfall in langen Matches
export const fatigueFactor = (m, foc) => 1 + Math.max(0, m.legIdx - 8) * 0.012 * (1 - foc / 100);

// Rechnen: mit Wahrscheinlichkeit ce wird falsch gestellt (naives T20/Single) oder das falsche Doppel angespielt
// Version 179 (Nutzerwunsch): schwaches Rechnen verrechnet sich typischerweise um 10 oder 20 Punkte – der Vorschlag passt dann zu
// einem Rest ± 10/20 (z. B. 32 → D11 wie für 22, 36 → D13 wie für 26); sonst (kein anderes Ziel) bleibt der alte Fehler
function maybeMiscalc(target, rem, ce, rng, dartsLeft = 3) {
  if (rem > 230 || !rng.chance(rem <= 40 ? ce * 0.5 : ce)) return target;
  for (const off of rng.shuffle([-10, -20, 10, 20])) {
    const w = rem + off;
    if (w < 2 || w > 230 || w === rem) continue;
    const t = suggestTarget(w, dartsLeft, null, null, false);
    if (t !== target) return t;
  }
  if (isDoubleLabel(target) && target !== 'BULL') return 'D' + Math.min(20, Math.max(1, +target.slice(1) + rng.pick([-5, 5])));
  return rem > 60 ? rng.pick(['T20', 'T19', 'T18']) : 'S' + rng.int(1, 20);
}

export const DIN_LATERAL = 2.2, DIN_SWITCH = 0.5;   // Double-in: seitliche Streuung × 2,2; Wechsel aufs andere Doppel ab halb verbautem Feld
// KI-Dart: Ziel wählen + werfen. Rückgabe {target, x, y, hit}
export function aiDart(m, i, attrs, rng, sig = aiSigma(attrs), mult = 1, forced = null) {
  // forced = vom Spieler gewählter Weg (keine Rechenfehler); attrs.ce = eigene Fehlerquote (Tour-Modus, aus Rechnen 0–60)
  // Version 144/147: Double-in – erst ein Doppel: Lieblingsdoppel (`attrs.dinPref`: Tops, manche D16); ist es verbaut, das andere
  const din = needsIn(m, i), dinA = attrs.dinPref === 16 ? 'D16' : 'D20', dinB = dinA === 'D16' ? 'D20' : 'D16';
  let target = forced ?? (din ? dinA : maybeMiscalc(suggestTarget(m.rem[i], dartsLeft(m), rng.next(), m.visit.start, (attrs.ce ?? calcError(attrs.cal)) <= PLAN_CE), m.rem[i], attrs.ce ?? calcError(attrs.cal), rng, dartsLeft(m)));
  // Einsteckwinkel: Steckende Darts dieser Aufnahme verbauen das Feld (obstruction.js). Im reinen Scoring wechselt die KI auf T19/T18/T17.
  const ang = attrs.angle, tips = m.visit.tips;
  let block = ang != null && tips?.length ? blockage(targetPoint(target), tips, ang) : 0;
  if (din && forced == null && block >= DIN_SWITCH) {
    const b2 = blockage(targetPoint(dinB), tips, ang);
    if (b2 <= block - 0.3) { target = dinB; block = b2; }
  }
  if (block >= SWITCH_AT && forced == null && !din && m.rem[i] > 230) {
    const alt = ['T19', 'T18', 'T17'].map(t => [t, blockage(targetPoint(t), tips, ang)]).sort((a, b) => a[1] - b[1])[0];
    if (alt[1] <= block - 0.3) { target = alt[0]; block = alt[1]; }
  }
  const p = targetPoint(target);
  const base = isDoubleLabel(target) ? sig.dbl : sig.score;
  const s = base * mult * pressureFactor(m, i, target, attrs.men, attrs.exp) * fatigueFactor(m, attrs.foc)
    * (ang != null ? stability(ang, isDoubleLabel(target)) * (1 + BLOCK_SIGMA * block) : 1);
  let x, y;
  if (din && isDoubleLabel(target) && target !== 'BULL') {
    // Version 147: Einstiegs-Doppel streuen seitlich deutlich mehr als in der Höhe (entlang des Doppelrings) → gelegentlich das Nachbar-Doppel
    // (Tops → D1/D5, D16 → D8/D7), wie in echt; die Trefferquote auf ein Doppel bleibt etwa gleich.
    const r = Math.hypot(p.x, p.y), ux = p.x / r, uy = p.y / r, a = rng.normal(0, s), b = rng.normal(0, s * DIN_LATERAL);
    x = p.x + ux * a - uy * b; y = p.y + uy * a + ux * b;
  } else { x = p.x + rng.normal(0, s); y = p.y + rng.normal(0, s); }
  const dfl = deflect({ x, y }, tips, ang, rng);        // Version 205: Abpraller am steckenden Dart
  if (dfl) ({ x, y } = dfl);
  const bp = bounceChance(block, attrs.bounce);         // Version 135: eigene Darts (attrs.bounce) – KI ohne Angabe wie bisher
  const rp = robinChance({ x, y }, tips, attrs.robin);   // Version 136: Robin Hood (Dart im Flight des vorherigen)
  const hit = bp > 0 && rng.chance(bp) ? BOUNCER : rp > 0 && rng.chance(rp) ? ROBIN : scoreAt(x, y);
  return { target, x, y, hit, block };
}

// Manuelles Zielen: Amplitude (mm) und Frequenz (Zyklen/s) der Linien + Reststreuung
export function manualParams(attrs, m, i, target) {
  let amp = 66 - 0.48 * attrs.sco;              // Scoring 42 → 46 mm, 95 → 20 mm
  let freq = 0.75 + 0.6 * (1 - attrs.sco / 99);  // Scoring 42 → 1,1 Hz, 95 → 0,77 Hz
  let scatter = 12 - attrs.foc * 0.085;          // Fokus → Zufallsstreuung (mm)
  if (isDoubleLabel(target)) {
    const k = 1.3 - attrs.fin / 200;             // Doppelquote → Genauigkeit auf Doppel
    amp *= k; scatter *= k;
  }
  const pf = pressureFactor(m, i, target, attrs.men, attrs.exp) * fatigueFactor(m, attrs.foc);
  return { amp: amp * pf, freq: freq * Math.sqrt(pf), scatter: scatter * pf, pressure: pf > 1.05 };
}

// Weiche Dreieckskurve in [-1, 1] (Phase in Zyklen)
export function wave(phase) {
  const p = phase - Math.floor(phase);
  const tri = 1 - 4 * Math.abs(((p + 0.25) % 1) - 0.5);
  return 0.75 * tri + 0.25 * Math.sin(2 * Math.PI * p);
}

// New Star Darts: Kreis-Zielmechanik – zwei Linien wie beim manuellen Zielen, am Schnittpunkt ein Kreis,
// in dem der Dart gleichverteilt landet. Kreis aus Scoring (Doppel/Bull: Finishing), Linien aus Fokus.
// Fähigkeit 0–60 ≙ Attribut 87,5–100; Druck (Matchdart, Entscheidungsleg) und Ausdauer vergrößern beides.
const skillEq = v => (v - 87.5) / (12.5 / 60);
// Kreisradius (mm) aus der Fähigkeit 0–60. Version 82 (Nutzerwunsch: „wird zu schnell zu klein und dadurch zu genau“): schrumpft anfangs langsam,
// erst gegen Ende stärker (konvex, Exponent 1,4) und bleibt am Ende größer: 17 mm bei 0, 15,1 bei 20, 13,6 bei 30, 11,9 bei 40, 10,0 bei 50, 8 bei 60
// (vorher linear 17 − 0,2 × Fähigkeit: 15/13/11/9/7/5 – bei sauberem Linienstopp traf man mit 5 mm fast jedes T20, das ist unrealistisch genau).
// Unter 0 (Nervosität, Energiemangel) wächst der Kreis wie bisher linear (+0,2 mm je Punkt).
// Version 267 (Nutzerwunsch): Startkreis kleiner, schrumpft dafür weniger – 12,6 mm bei 0 (im Match × 1,15 = 14,5) bis 8 mm bei 60 (× 1,15 = 9,2)
export const CIRCLE_MAX = 12.6, CIRCLE_MIN = 8, CIRCLE_CURVE = 1.4;
export const circleRadius = sk => (sk < 0 ? CIRCLE_MAX - 0.2 * sk : CIRCLE_MAX - (CIRCLE_MAX - CIRCLE_MIN) * Math.pow(Math.min(sk, 60) / 60, CIRCLE_CURVE));
// Linien (Zielkreuz): Ausschlag und Grundtempo aus dem Fokus (Fähigkeit 0–60) – im Spiel UND im Training gleich (Version 89)
export const lineParams = fk => ({ amp: clamp(40 - 0.25 * fk, 24, 50), freq: clamp(0.8 - 0.004 * fk, 0.55, 1.2) });
export const Y_SPEED = 0.8;   // Linie von oben nach unten etwas langsamer als die seitliche
// Tempo-Steigerung (Version 89, Nutzerwunsch): bei jedem Richtungswechsel einer Linie (jedes „wieder hoch/runter“) wird sie um RAMP_STEP schneller,
// höchstens bis × RAMP_CAP. Liefert den Phasenfortschritt (in Zyklen; ein Richtungswechsel = ½ Zyklus) nach t Sekunden bei Grundtempo `freq`.
export const RAMP_STEP = 1.1, RAMP_CAP = 2.5;
export function rampPhase(t, freq, step = RAMP_STEP, cap = RAMP_CAP) {
  let rest = Math.max(0, t), phase = 0, mult = 1;
  while (mult < cap) {
    const v = freq * mult, seg = 0.5 / v;                 // Dauer dieser halben Schwingung
    if (rest <= seg) return phase + v * rest;
    rest -= seg; phase += 0.5; mult *= step;
  }
  return phase + freq * cap * rest;
}
// Version 260 (Nutzerwunsch): generell mehr Streuung (Kreis × 1,15, auch im Training – Training = Spiel) und im Match auf das Bull nochmals × 1,25 (Bull-Check sonst zu leicht)
export const MATCH_CIRCLE = 1.15, BULL_CIRCLE = 1.25;
// Version 265 (Nutzerwunsch „zu Beginn zu schwer“): der Aufschlag wächst mit der Fähigkeit hinein – 0 Punkte × 1,0, ab 30 Punkten voll × 1,15
export const MATCH_CIRCLE_FULL = 30;
export const matchCircle = () => MATCH_CIRCLE;   // Version 267: wieder konstant – die kleinere Startgröße steckt jetzt in CIRCLE_MAX
export function circleParams(attrs, m, i, target) {
  const dbl = isDoubleLabel(target) || target === '25';
  const sk = skillEq(dbl ? attrs.fin : attrs.sco), fk = skillEq(attrs.foc);
  const pf = pressureFactor(m, i, target, attrs.men, attrs.exp) * fatigueFactor(m, attrs.foc);
  const block = attrs.angle != null ? blockage(targetPoint(target), m.visit.tips, attrs.angle) : 0;   // verbautes Feld: größerer Kreis
  const k = attrs.angle != null ? stability(attrs.angle, dbl) * (1 + BLOCK_SIGMA * block) : 1;
  return {
    block,
    radius: clamp(circleRadius(sk), CIRCLE_MIN, 36) * pf * k * matchCircle(sk) * (target === 'BULL' ? BULL_CIRCLE : 1),
    amp: lineParams(fk).amp,
    freq: lineParams(fk).freq * Math.sqrt(pf),
    pressure: pf > 1.05,
  };
}
// Gleichverteilter Punkt im Kreis
// Version 261: edge > 0 (Nervosität) verschiebt die Treffer zum Rand – Abstand r × u^(1/(2+edge)); edge 0 = gleichverteilt (u^(1/2))
export function landInCircle(x, y, r, rng, edge = 0) {
  const a = rng.next() * 2 * Math.PI, d = r * Math.pow(rng.next(), 1 / (2 + Math.max(0, edge)));
  return { x: x + Math.cos(a) * d, y: y + Math.sin(a) * d };
}

// Zielvorschlag mit möglichem Rechenfehler (für den eigenen Wurf im Liveticker)
export const miscalcTarget = (target, rem, ce, rng, dartsLeft = 3) => maybeMiscalc(target, rem, ce, rng, dartsLeft);
