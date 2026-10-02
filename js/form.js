// Bühne & Selbstvertrauen (DOM-frei)
// Bühne: in Majors/World Series/Premier League (späte Runden stärker) und gegen große Namen (PDC-Top-16)
// zählt Erfahrung zusätzlich: ±0,5 Attributpunkte je Erfahrungsstufe über/unter +3, × Bühnenfaktor.
// Selbstvertrauen (player.momentum −10…+10): Siege/Titel heben, Niederlagen senken, wöchentlich −20 % Richtung 0.
// Ab ±3 aktiv: ±1,5 / ±3 / ±4 auf Scoring, Finishing, Fokus (nur eigener Spieler, über perf()).
import { clamp } from './util.js';
import { overall } from './player.js';

export const STAGE_CATS = ['major', 'ws', 'pl'];
export const EXP_CENTER = 3;

// Bühnenfaktor eines Matches (0 = normal). inst.big = PDC-Top-16-IDs zum Turnierstart.
export function stageFactor(inst, a, b) {
  if (!inst) return 0;
  const rem = inst.rounds?.[inst.current]?.remaining ?? 99;
  if (STAGE_CATS.includes(inst.cat) && inst.eventId !== 'wm-quali') return rem <= 8 ? 1.5 : 1;
  const big = inst.big ?? [];
  if ((a === 'P' && big.includes(b)) || (b === 'P' && big.includes(a))) return 0.7;
  return 0;
}
export const stageDelta = (exp, f) => (f ? f * ((exp ?? 0) - EXP_CENTER) * 0.5 : 0);
// Erfahrungs-Effekt anwenden (Kopie)
export function applyStage(a, f) {
  const d = stageDelta(a.exp, f);
  if (!d) return a;
  return { ...a, sco: a.sco + d, fin: a.fin + d, men: a.men + d };
}

// ---- Selbstvertrauen ----
export const MOMENTUM_STEPS = [
  { min: 9, bonus: 4, label: 'Unaufhaltsam', icon: '🔥🔥🔥' },
  { min: 6, bonus: 3, label: 'Heißer Lauf', icon: '🔥🔥' },
  { min: 3, bonus: 1.5, label: 'Selbstvertrauen', icon: '🔥' },
  { min: -2.99, bonus: 0, label: 'Normal', icon: '' },
  { min: -5.99, bonus: -1.5, label: 'Verunsichert', icon: '🥶' },
  { min: -8.99, bonus: -3, label: 'Formkrise', icon: '🥶🥶' },
  { min: -99, bonus: -4, label: 'Totale Krise', icon: '🥶🥶🥶' },
];
export const momentumState = p => MOMENTUM_STEPS.find(s => (p.momentum ?? 0) >= s.min);
export const momentumBonus = p => momentumState(p).bonus;

// Nach jedem eigenen Match: Sieg +1 (gegen Stärkere/große Namen +1,5), Niederlage −1 (gegen Schwächere −1,5, gegen Stärkere nur −0,4); lokal ¼
export function updateMomentum(p, { won, opp, cat, big }) {
  const diff = opp ? overall(opp.attrs) - overall(p.attrs) : 0;
  let d = won ? (diff >= 5 || big ? 1.5 : 1) : (diff >= 3 ? -0.4 : diff >= -3 ? -1 : -1.5);
  if (cat === 'local') d *= 0.25;
  const before = momentumState(p);
  p.momentum = clamp(Math.round(((p.momentum ?? 0) + d) * 10) / 10, -10, 10);
  const after = momentumState(p);
  return after !== before ? after : null;          // Stufenwechsel → News
}
export function titleMomentum(p, cat) { if (cat !== 'local') p.momentum = clamp((p.momentum ?? 0) + 3, -10, 10); }
// Wöchentlich Richtung 0: −20 % und 0,3 (negativ 0,6 – Krisen verfliegen schneller)
export function momentumDecay(p) {
  const m = (p.momentum ?? 0) * 0.8, step = m > 0 ? 0.3 : 0.6;
  p.momentum = Math.abs(m) <= step ? 0 : Math.round((m - Math.sign(m) * step) * 10) / 10;
}

// ---- Lampenfieber ----
// Neu auf der Pro Tour: in Profi-Events (PC/ET/Majors/WS/PL) −5 auf Scoring, Finishing, Mental und −3 Fokus,
// baut sich linear über die ersten 60 Profi-Matches ab (≈ erstes Tourcard-Jahr). player.proMatches zählt mit.
export const PRO_CATS = ['pc', 'et', 'major', 'ws', 'pl'];
export const NERVES_MATCHES = 60, NERVES_MAX = 5;
export const proMatchesOf = p => p.proMatches ?? (p.everTourcard ? NERVES_MATCHES : 0);
export const nervesLevel = p => NERVES_MAX * Math.max(0, 1 - proMatchesOf(p) / NERVES_MATCHES);
export const nervesFor = (inst, p) => (inst && PRO_CATS.includes(inst.cat) ? nervesLevel(p) : 0);
export function applyNerves(a, n) {
  if (!n) return a;
  return { ...a, sco: a.sco - n, fin: a.fin - n, men: a.men - n, foc: a.foc - n * 0.6 };
}
