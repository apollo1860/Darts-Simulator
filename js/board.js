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
export const fieldName = l => (l === 'BULL' ? 'Bull' : l === '25' ? '25' : l === 'OUT' ? 'Daneben' : l[0] === 'S' ? l.slice(1) : l);

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

// Checkout-Weg mit höchstens `darts` Darts (wenigste Darts zuerst), sonst null
export function checkoutRoute(rem, darts = 3) {
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
export function suggestTarget(rem, dartsLeft = 3) {
  const route = rem <= 170 ? checkoutRoute(rem, dartsLeft) : null;
  if (route) return route[0];
  if (rem > 230) return 'T20';
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
