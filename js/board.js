// Dartscheibe: Geometrie (mm, Mittelpunkt 0/0, y nach unten), Trefferauswertung, Checkout-Wege (DOM-frei)

export const ORDER = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
export const R = { bull: 6.35, outerBull: 15.9, tripleIn: 99, tripleOut: 107, doubleIn: 162, doubleOut: 170 };

// Winkel (Grad) der Segmentmitte, 0 = oben, im Uhrzeigersinn
export const segAngle = num => ORDER.indexOf(num) * 18;

// Treffer an Position (x, y) auswerten
export function scoreAt(x, y) {
  const r = Math.hypot(x, y);
  if (r <= R.bull) return hit('BULL', 50, 2, 25);
  if (r <= R.outerBull) return hit('25', 25, 1, 25);
  if (r > R.doubleOut) return hit('OUT', 0, 0, 0);
  const deg = (Math.atan2(x, -y) * 180 / Math.PI + 369) % 360;
  const num = ORDER[Math.floor(deg / 18) % 20];
  const mult = r >= R.tripleIn && r <= R.tripleOut ? 3 : r >= R.doubleIn ? 2 : 1;
  return hit((mult === 3 ? 'T' : mult === 2 ? 'D' : 'S') + num, num * mult, mult, num);
}
const hit = (label, score, mult, num) => ({ label, score, mult, num, double: mult === 2 });

// Zielpunkt (Mitte des Feldes) für ein Label
export function targetPoint(label) {
  if (label === 'BULL') return { x: 0, y: 0 };
  if (label === '25') return { x: 0, y: -11 };
  const kind = label[0], num = +label.slice(1);
  const r = kind === 'T' ? 103 : kind === 'D' ? 166 : 134;
  const a = segAngle(num) * Math.PI / 180;
  return { x: Math.sin(a) * r, y: -Math.cos(a) * r };
}

export function labelValue(label) {
  if (label === 'BULL') return 50;
  if (label === '25') return 25;
  const n = +label.slice(1);
  return label[0] === 'T' ? 3 * n : label[0] === 'D' ? 2 * n : n;
}
export const isDoubleLabel = l => l === 'BULL' || l[0] === 'D';
export const fieldName = l => (l === 'BULL' ? 'Bull' : l === '25' ? '25' : l === 'OUT' ? 'Daneben' : l === 'BOUNCER' ? 'Bouncer' : l === 'ROBIN' ? 'Robin Hood' : l[0] === 'S' ? l.slice(1) : l);

// ---- Checkout-Wege ----
// Strafpunkte je Dart (niedrig = bevorzugt); Doppel-Präferenz wie im Profi-Darts
const DBL_PREF = [16, 20, 8, 18, 12, 10, 4, 2, 6, 14, 19, 17, 15, 13, 11, 9, 7, 5, 3, 1];
const FINISHERS = [...DBL_PREF.map((n, i) => ({ l: 'D' + n, v: 2 * n, p: i })), { l: 'BULL', v: 50, p: 5 }];
const SETUP = [];
for (let n = 1; n <= 20; n++) {
  SETUP.push({ l: 'T' + n, v: 3 * n, p: n === 20 ? 0 : n === 19 ? 0.6 : n === 18 ? 1.4 : n === 17 ? 1.8 : 3 + (20 - n) * 0.05 });
  SETUP.push({ l: 'S' + n, v: n, p: 1 + (20 - n) * 0.02 });
}
SETUP.push({ l: '25', v: 25, p: 4 }, { l: 'BULL', v: 50, p: 4.5 }, ...FINISHERS.map(f => ({ ...f, p: f.p + 4 })));

// best[k][r] = {route, pen} : Finish von r mit genau k Darts
const best = [null, [], [], []];
for (const f of FINISHERS) if (!best[1][f.v] || f.p < best[1][f.v].pen) best[1][f.v] = { route: [f.l], pen: f.p };
for (let k = 2; k <= 3; k++) {
  for (let r = 2; r <= 170; r++) {
    let b = null;
    for (const s of SETUP) {
      const rest = best[k - 1][r - s.v];
      if (r - s.v < 2 || !rest) continue;
      const pen = s.p * (1 + 0.1 * k) + rest.pen; // frühe Darts stärker gewichtet → T20 zuerst
      if (!b || pen < b.pen) b = { route: [s.l, ...rest.route], pen };
    }
    best[k][r] = b;
  }
}

// Version 177 (Nutzervorgabe): PDC-Checkout-Tabelle (3-Dart-Finishes 99–170) als Vorbild für Checkvorschläge mit 3 Darts in der Hand
const PDC_TABLE = {
  99: 'T19 S10 D16', 101: 'T20 S9 D16', 102: 'T16 S14 D20', 103: 'T19 S6 D20', 104: 'T16 S16 D20', 105: 'T20 S13 D16',
  106: 'T20 S6 D20', 107: 'T19 S10 D20', 108: 'T20 S16 D16', 109: 'T20 S17 D16', 110: 'T20 S10 D20', 111: 'T19 S14 D20',
  112: 'T20 S20 D16', 113: 'T19 S16 D20', 114: 'T20 S14 D20', 115: 'T20 S15 D20', 116: 'T20 S16 D20', 117: 'T20 S17 D20',
  118: 'T20 S18 D20', 119: 'T19 S12 BULL', 120: 'T20 S20 D20', 121: 'T20 S11 BULL', 122: 'T18 S18 BULL', 123: 'T19 S16 BULL',
  124: 'T20 S14 BULL', 125: '25 T20 D20', 126: 'T19 S19 BULL', 127: 'T20 S17 BULL', 128: 'S18 T20 BULL', 129: 'S19 T20 BULL',
  130: 'T20 S20 BULL', 131: 'T20 T13 D16', 132: '25 T19 BULL', 133: 'T20 T19 D8', 134: 'T20 T14 D16', 135: '25 T20 BULL',
  136: 'T20 T20 D8', 137: 'T20 T19 D10', 138: 'T20 T18 D12', 139: 'T19 T14 D20', 140: 'T20 T20 D10', 141: 'T20 T19 D12',
  142: 'T20 T14 D20', 143: 'T20 T17 D16', 144: 'T20 T20 D12', 145: 'T20 T15 D20', 146: 'T20 T18 D16', 147: 'T20 T17 D18',
  148: 'T20 T20 D14', 149: 'T20 T19 D16', 150: 'T20 T18 D18', 151: 'T20 T17 D20', 152: 'T20 T20 D16', 153: 'T20 T19 D18',
  154: 'T20 T18 D20', 155: 'T20 T19 D19', 156: 'T20 T20 D18', 157: 'T20 T19 D20', 158: 'T20 T20 D19', 160: 'T20 T20 D20',
  161: 'T20 T17 BULL', 164: 'T20 T18 BULL', 167: 'T20 T19 BULL', 170: 'T20 T20 BULL',
};
const PDC3 = Object.fromEntries(Object.entries(PDC_TABLE).map(([r, w]) => [r, w.split(' ')]));

// Checkout-Weg mit höchstens `darts` Darts (wenigste Darts zuerst), sonst null; mit 3 Darts gilt die PDC-Tabelle
export function checkoutRoute(rem, darts = 3) {
  if (darts >= 3 && PDC3[rem]) return PDC3[rem];
  for (let k = 1; k <= darts; k++) if (best[k][rem]) return best[k][rem].route;
  return null;
}

// Gutes Restergebnis (für Stelldarts)
function leaveScore(l) {
  if (l < 0 || l === 1) return -1000;
  if (l === 0) return -1000;
  if (best[1][l]) return 100 - best[1][l].pen * 3;
  if (best[2][l]) return 60 - l / 10;
  if (best[3][l]) return 30 - l / 20;
  return 10 - Math.max(0, 200 - l) / 50;
}

// Empfohlenes Ziel für den nächsten Dart
// mix (0…1, Zufallszahl des Aufrufers, optional): in der reinen Scoring-Phase (> 230) gelegentlich T19/T18 statt T20 – sonst bleibt der
// Rest immer ein Vielfaches von 20 unter 501 und fast jedes Leg endet in der Check-Phase auf 161/141/121/101 …
export const VARIETY_T19 = 0.12, VARIETY_T18 = 0.03;
// Version 178 (Nutzervorgabe): Scoring-Pläne für bestimmte Reste zu Beginn der Aufnahme – Ziel je Dart (1./2./3.), solange der Rest
// noch über 170 liegt; darunter gilt wieder der Checkout-Weg. Z. B. 232: T19, dann Bull (175 → 125 bzw. 213 → 163).
export const SCORE_PLAN = {
  233: ['T19', 'T19', 'T19'], 232: ['T19', 'BULL', 'BULL'], 262: ['T18', 'T18', 'T18'], 263: ['T19', 'T19', 'T19'], 265: ['T19', 'T19', 'T19'],
  266: ['T19', 'T19', 'T19'], 271: ['T19', 'T19', 'T19'], 272: ['T19', 'T19', 'BULL'], 302: ['T18', 'T18', 'T18'], 306: ['T19', 'T19', 'T19'],
};
// plans: Scoring-Pläne nur mit hohem Rechnen-Wert (Aufrufer prüft `PLAN_CE`)
export const PLAN_CE = 0.05;   // Rechenfehler-Quote ≤ 5 % ⇔ eigener Spieler Rechnen ≥ 40
export function suggestTarget(rem, dartsLeft = 3, mix = null, visitStart = null, plans = true) {
  const route = rem <= 170 ? checkoutRoute(rem, dartsLeft) : null;
  if (route) return route[0];
  const plan = plans && SCORE_PLAN[visitStart ?? (dartsLeft === 3 ? rem : -1)];
  if (plan && rem > 170) return plan[3 - dartsLeft];
  if (rem > 230) return mix == null || mix >= VARIETY_T19 + VARIETY_T18 ? 'T20' : mix < VARIETY_T19 ? 'T19' : 'T18';
  // Stelldart: bestes Rest-Ergebnis, bei Gleichstand mehr Punkte
  let bestL = 'T20', bestS = -Infinity;
  for (const s of SETUP) {
    if (s.l[0] === 'D' || s.l === 'BULL') continue;
    const sc = leaveScore(rem - s.v) - s.p * 2 + s.v / 60;
    if (sc > bestS) { bestS = sc; bestL = s.l; }
  }
  return bestL;
}

export const BOGEY = new Set([169, 168, 166, 165, 163, 162, 159]);

// Alternative Checkout-Wege (verschiedene erste Darts, wenige Darts bevorzugt) – für Entscheidungen im Match
export function alternativeRoutes(rem, darts = 3, n = 3) {
  if (rem > 170 || BOGEY.has(rem)) return [];
  const all = [];
  const sig = r => [...r].sort().join();                     // gleiche Darts in anderer Reihenfolge = gleicher Weg
  const add = (route, pen) => {
    const ex = all.find(o => sig(o.route) === sig(route));
    if (!ex) all.push({ route, pen });
    else if (pen < ex.pen) { ex.route = route; ex.pen = pen; }
  };
  if (best[1][rem]) add(best[1][rem].route, best[1][rem].pen);
  for (let k = 2; k <= darts; k++) {
    for (const s of SETUP) {
      const rest = best[k - 1][rem - s.v];
      if (rem - s.v >= 2 && rest) add([s.l, ...rest.route], s.p * (1 + 0.1 * k) + rest.pen + (k - 1) * 2);
    }
  }
  all.sort((a, b) => a.pen - b.pen);
  const res = [], firsts = new Set();
  for (const o of all) {
    if (res.length >= n) break;
    if (firsts.has(o.route[0])) continue;
    firsts.add(o.route[0]); res.push(o.route);
  }
  return res;
}
