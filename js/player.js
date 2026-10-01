// Attribute, Gesamtwertung, abgeleitete Werte, XP, Erfahrung (DOM-frei)
// Attribute sind Perzentile (1–100): „stärker als X von 100 Dartspielern“ – NICHT der Average.
import { clamp } from './util.js';

export const ATTRS = [
  { key: 'sco', label: 'Scoring', short: 'SCO', info: 'Punkte pro Aufnahme (Average)' },
  { key: 'fin', label: 'Finishing', short: 'FIN', info: 'Checkout-Quote, Doppel' },
  { key: 'men', label: 'Mental', short: 'MEN', info: 'Druck: Entscheidungslegs, Matchdarts' },
  { key: 'foc', label: 'Fokus', short: 'FOK', info: 'Konstanz, Ausdauer, Ablenkungen' },
  { key: 'cal', label: 'Rechnen', short: 'REC', info: 'Wege stellen, Bogey-Zahlen vermeiden' },
];
export const START_VALUE = 60;
export const CREATION_POINTS = 25;      // frei verteilbar bei der Charaktererstellung (1 Punkt = +1)
export const EXP_MIN = -4, EXP_MAX = 10;

export const overall = a => clamp(Math.round(a.sco * 0.36 + a.fin * 0.27 + a.men * 0.13 + a.foc * 0.13 + (a.cal ?? a.fin) * 0.11), 1, 100);

// Perzentil → 3-Dart-Average (Stützstellen, linear interpoliert). 60 ≈ 65 Ø, 90 ≈ 89 Ø, 100 ≈ 106 Ø
const AVG_CURVE = [[1, 25], [20, 40], [40, 53], [60, 65], [70, 71], [80, 79], [85, 84], [90, 89], [95, 95], [97, 98], [98, 100], [99, 103], [100, 106]];
function interp(tab, x, xi = 0, yi = 1) {
  if (x <= tab[0][xi]) return tab[0][yi];
  for (let i = 1; i < tab.length; i++) {
    if (x <= tab[i][xi]) {
      const a = tab[i - 1], b = tab[i];
      return a[yi] + (b[yi] - a[yi]) * (x - a[xi]) / (b[xi] - a[xi]);
    }
  }
  return tab[tab.length - 1][yi];
}
export const avgForRating = r => interp(AVG_CURVE, r);
export const ratingForAvg = avg => clamp(Math.round(interp(AVG_CURVE, avg, 1, 0)), 1, 100);
// Genau (1 Nachkommastelle) – für KI-Spieler, damit die Spitze fein aufgelöst bleibt
export const ratingForAvgExact = avg => clamp(Math.round(interp(AVG_CURVE, avg, 1, 0) * 10) / 10, 1, 100);

export const targetAverage = a => avgForRating(a.sco);
export const checkoutBase = a => 0.06 + 0.0037 * a.fin;          // 60 → 28 %, 100 → 43 %

// Attribute für einen Ziel-Average erzeugen (KI-Spieler); Streuung oben kleiner (Perzentile drängen sich)
export function attrsForAverage(avg, rng, spread = 7) {
  const sco = ratingForAvgExact(avg);
  const sd = spread * Math.max(0.2, 1 - sco / 125);
  const around = (base, k = 1) => clamp(Math.round(rng.normal(base, sd * k)), 1, 100);
  return { sco, fin: around(sco - 1), men: around(sco - 2, 1.3), foc: around(sco - 1, 1.2), cal: around(sco, 1.3) };
}

export const startAttrs = (bonus = {}) => {
  const a = { sco: START_VALUE, fin: START_VALUE, men: START_VALUE, foc: START_VALUE, cal: START_VALUE };
  let left = CREATION_POINTS;
  for (const k of Object.keys(a)) {                    // ungültige/zu viele Punkte werden ignoriert
    const add = Math.max(0, Math.min(Math.floor(bonus[k] ?? 0), left));
    a[k] += add; left -= add;
  }
  return a;
};

// Rechenfehler-Wahrscheinlichkeit je Stelldart/Finish-Entscheidung: 60 → 12 %, 80 → 6 %, 100 → 0 %
export const calcError = cal => clamp((100 - (cal ?? 70)) * 0.003, 0, 0.3);

// Leistungsdaten für die Engines (Attribute + Erfahrung)
export const perf = p => {
  const a = { ...p.attrs, exp: p.exp ?? 0 };
  // Ermüdung über 30 % kostet Leistung (bis −6 Scoring, −8 Fokus, −4 Finishing bei 100 %)
  const f = Math.max(0, ((p.fatigue ?? 0) - 30) / 70);
  if (f) { a.sco -= f * 6; a.foc -= f * 8; a.fin -= f * 4; }
  return a;
};

// ---- XP → Attributpunkte ----
export const xpForNextPoint = earned => Math.round(70 + 1.6 * earned);
export function addXp(p, xp) {
  p.xp += xp; p.xpTotal += xp;
  let gained = 0;
  while (p.xp >= xpForNextPoint(p.pointsEarned)) {
    p.xp -= xpForNextPoint(p.pointsEarned);
    p.pointsEarned++; p.points++; gained++;
  }
  return gained;
}
// Höhere Perzentile sind teurer
export const attrCost = v => (v >= 95 ? 4 : v >= 85 ? 3 : v >= 70 ? 2 : 1);
export function raiseAttr(p, key) {
  const v = p.attrs[key], cost = attrCost(v);
  if (v >= 100 || p.points < cost) return false;
  p.attrs[key] = v + 1; p.points -= cost;
  return true;
}

// ---- Erfahrung (Clutch) −4 … +10 ----
// Kumulierte Clutch-Punkte je Stufe (Index 0 = −4)
const EXP_STEPS = [0, 50, 120, 220, 350, 520, 730, 980, 1280, 1640, 2060, 2550, 3120, 3780, 4550];
export const expForPoints = pts => EXP_MIN + Math.max(0, EXP_STEPS.findLastIndex(x => pts >= x));
export const expNext = exp => EXP_STEPS[exp - EXP_MIN + 1] ?? null;
export function addClutch(p, pts) {
  p.clutch = (p.clutch ?? 0) + pts;
  const before = p.exp ?? EXP_MIN;
  p.exp = Math.min(EXP_MAX, expForPoints(p.clutch));
  return p.exp - before;
}
export const expLabel = e => (e > 0 ? `+${e}` : `${e}`);

// XP-/Clutch-Faktor je Event-Kategorie
export const XP_FACTOR = { local: 0.8, ddv: 1.4, qschool: 1, challenge: 1, dev: 1, pc: 1.5, et: 1.5, ws: 2, major: 2, pl: 2 };
export const XP_BASE = { match: 14, win: 22, title: 60, perRound: 8, event: 75 };
