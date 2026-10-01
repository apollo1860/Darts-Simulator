// Wöchentliches Training (DOM-frei): 1 Einheit pro Woche auf ein Attribut.
// Fortschritt sammelt sich; Einheiten für +1 = 5 × Attributkosten (60 → 5, 75 → 10, 90 → 15, 95+ → 20).
// Jede Einheit bringt XP (mitwachsend mit dem Level) und +3 auf das Attribut für Turniere dieser + nächster Woche.
// Ohne Training: ab der 4. Woche in Folge droht pro Woche ein Formverlust (−1, eher bei hohen Werten).
import { ATTRS, attrCost } from './player.js';
import { RNG } from './rng.js';
import { addNews } from './news.js';
import { clamp, fmtEUR } from './util.js';
import { book } from './finance.js';
import { addXp, addClutch, xpForLevel, POINTS_PER_LEVEL } from './player.js';
import { marketValue } from './sponsors.js';

export const DECAY_AFTER = 4;           // Wochen ohne Training bis zum ersten Risiko
export const PREP_BONUS = 3, PREP_WEEKS = 2;   // Turniervorbereitung: +3 auf das trainierte Attribut (diese + nächste Woche)
// XP je Einheit: 3 % des aktuellen Level-Bedarfs × Qualität (mind. 10); Exhibition 5 %
export const trainingXp = (p, quality = 1) => Math.max(10, Math.round(xpForLevel(p.level ?? 1) * 0.03 * quality / 5) * 5);
export const exhibitionXp = p => Math.max(20, Math.round(xpForLevel(p.level ?? 1) * 0.05 / 5) * 5);
export const sessionsFor = v => 5 * attrCost(v);
export const DECAY_FLOOR = 50;          // darunter kein Formverlust
const tr = state => (state.training ??= { progress: {}, idle: 0, sessions: 0, lost: 0 });
export const trainingOf = tr;
export const trainedThisWeek = state => !!state.week.trained;
export const weekActivity = state => state.week.activity ?? (state.week.trained ? 'train' : null);

// Eine Trainingseinheit. Rückgabe {gain (0..1 Fortschritt), up (Attribut gestiegen), text}
export function train(state, key) {
  if (weekActivity(state)) return null;                       // nur 1 Aktivität pro Woche
  const t = tr(state), p = state.player, rng = new RNG(state.rng);
  const v = p.attrs[key];
  const need = sessionsFor(v);
  const quality = rng.pick([0.7, 1, 1, 1, 1.3]);              // Tagesform im Training
  const labels = { 0.7: 'Zähe Einheit', 1: 'Solides Training', 1.3: 'Starke Einheit' };
  t.progress[key] = (t.progress[key] ?? 0) + quality / need;
  let up = false;
  if (t.progress[key] >= 1 && v < 100) { p.attrs[key] = v + 1; t.progress[key] -= 1; up = true; }
  state.week.trained = key; state.week.activity = 'train'; state.lastTrained = key;
  t.idle = 0; t.sessions++;
  p.prep = { key, bonus: PREP_BONUS, weeks: PREP_WEEKS };
  const xp = trainingXp(p, quality), ups = addXp(p, xp);
  const label = ATTRS.find(a => a.key === key).label;
  if (up) addNews(state, 'xp', `Training: ${label} steigt auf ${p.attrs[key]}`, 'Regelmäßiges Training zahlt sich aus.');
  if (ups) addNews(state, 'xp', `⬆️ Level ${p.level}! +${ups * POINTS_PER_LEVEL} Attributpunkte`, 'Durch Training aufgestiegen – verteile die Punkte im Spielerprofil.');
  return { gain: quality / need, up, text: labels[quality], progress: clamp(t.progress[key], 0, 1), need, xp, ups };
}

// Am Wochenende (vor dem Wechsel): Trainingspause zählen, ggf. Formverlust
export function trainingWeekEnd(state) {
  const t = tr(state), p = state.player;
  if (p.prep && --p.prep.weeks <= 0) delete p.prep;          // Turniervorbereitung läuft ab
  if (state.week.trained) return null;
  t.idle++;
  if (t.idle < DECAY_AFTER) return null;
  const rng = new RNG(state.rng);
  const risk = clamp(0.1 + (t.idle - DECAY_AFTER) * 0.05, 0, 0.3);
  if (!rng.chance(risk)) return null;
  // Höhere Werte verlieren eher (gewichtete Auswahl), Untergrenze DECAY_FLOOR
  const cand = ATTRS.filter(a => p.attrs[a.key] > DECAY_FLOOR);
  if (!cand.length) return null;
  const weights = cand.map(a => Math.pow(p.attrs[a.key], 2));
  let r = rng.next() * weights.reduce((x, y) => x + y, 0), pick = cand[0];
  for (let i = 0; i < cand.length; i++) { r -= weights[i]; if (r <= 0) { pick = cand[i]; break; } }
  p.attrs[pick.key]--; t.lost++;
  t.progress[pick.key] = 0;
  addNews(state, 'ranking', `Formverlust: ${pick.label} −1`, `${t.idle} Wochen ohne Training. Trainiere wieder regelmäßig (1 Einheit pro Woche), sonst geht es weiter bergab.`);
  return pick.key;
}

// ---- Wochenplan: genau EINE Aktivität pro Woche ----
export const ACTIVITIES = {
  train: { label: 'Training', icon: '🏋️', info: 'XP + Turniervorbereitung (+3 auf das Attribut), schützt vor Formverlust' },
  rest: { label: 'Ruhetag', icon: '🛋️', info: 'Ermüdung −30' },
  sponsor: { label: 'Sponsortermin', icon: '🤝', info: 'Geld von deinen Sponsoren (nur mit aktivem Vertrag)' },
  exhibition: { label: 'Exhibition', icon: '🎪', info: 'Showkampf: Geld + Erfahrung, aber Ermüdung +20' },
};

export function canDo(state, type) {
  if (weekActivity(state)) return { ok: false, reason: 'Diese Woche schon verplant' };
  if (type === 'sponsor' && !state.sponsors.active.length) return { ok: false, reason: 'Kein aktiver Sponsor' };
  if (type === 'rest' && !(state.player.fatigue > 0)) return { ok: false, reason: 'Du bist ausgeruht' };
  return { ok: true };
}

// Geldbetrag eines Sponsortermins bzw. einer Exhibition (für Anzeige + Auszahlung)
export const sponsorGigValue = state => state.sponsors.active.reduce((sum, c) =>
  sum + Math.max(150, Math.round((c.type === 'annual' ? c.amount * 0.04 : c.type === 'event' ? c.amount * 0.6 : c.amount * 0.3) / 10) * 10), 0);
export const exhibitionValue = state => (state.player.tour === 'tour'
  ? Math.round((500 + marketValue(state) * 0.02) / 50) * 50 : 200);

export function doActivity(state, type) {
  const st = canDo(state, type);
  if (!st.ok) return { ok: false, text: st.reason };
  const p = state.player, rng = new RNG(state.rng);
  p.fatigue ??= 0;
  state.week.activity = type;
  if (type === 'rest') {
    p.fatigue = Math.max(0, p.fatigue - 30);
    return { ok: true, text: `Erholt – Ermüdung jetzt ${p.fatigue} %.` };
  }
  if (type === 'sponsor') {
    const v = sponsorGigValue(state);
    book(state, v, 'Sponsortermin (Autogramme, Fotoshooting)', 'sponsor');
    state.sponsors.total = (state.sponsors.total ?? 0) + v;
    return { ok: true, text: `Fotoshooting und Autogrammstunde: ${fmtEUR(v)}.` };
  }
  if (type === 'exhibition') {
    const v = Math.round(exhibitionValue(state) * rng.float(0.8, 1.2) / 10) * 10;
    book(state, v, 'Exhibition', 'prize');
    const xp = exhibitionXp(p), ups = addXp(p, xp); addClutch(p, 3);
    p.fatigue = Math.min(100, p.fatigue + 20);
    return { ok: true, text: `Showkampf vor Publikum: ${fmtEUR(v)}, +${xp} XP${ups ? ` – Level ${p.level}!` : ''}. Ermüdung jetzt ${p.fatigue} %.` };
  }
  return { ok: false, text: 'Unbekannt' };
}

// ---- Ermüdung (0–100): Turniere kosten Kraft, jede Woche −10 Erholung ----
export function addEventFatigue(state, inst) {
  const p = state.player;
  const matches = inst.rounds.reduce((n, r) => n + r.matches.filter(m => (m.a === 'P' || m.b === 'P') && !m.bye && m.score).length, 0);
  const travel = inst.cat === 'local' ? 0 : 4;
  p.fatigue = Math.min(100, (p.fatigue ?? 0) + matches * 4 + travel);
}
export function weeklyRecovery(state) {
  const p = state.player;
  p.fatigue = Math.max(0, (p.fatigue ?? 0) - 10);
}
