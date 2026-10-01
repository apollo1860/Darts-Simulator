// Wöchentliches Training (DOM-frei): 1 Einheit pro Woche auf ein Attribut.
// Fortschritt sammelt sich; Einheiten für +1 = 5 × Attributkosten (60 → 5, 75 → 10, 90 → 15, 95+ → 20).
// Ohne Training: ab der 3. Woche in Folge droht pro Woche ein Formverlust (−1, eher bei hohen Werten).
import { ATTRS, attrCost } from './player.js';
import { RNG } from './rng.js';
import { addNews } from './news.js';
import { clamp } from './util.js';

export const DECAY_AFTER = 3;           // Wochen ohne Training bis zum ersten Risiko
export const sessionsFor = v => 5 * attrCost(v);
export const DECAY_FLOOR = 50;          // darunter kein Formverlust
const tr = state => (state.training ??= { progress: {}, idle: 0, sessions: 0, lost: 0 });
export const trainingOf = tr;
export const trainedThisWeek = state => !!state.week.trained;

// Eine Trainingseinheit. Rückgabe {gain (0..1 Fortschritt), up (Attribut gestiegen), text}
export function train(state, key) {
  if (state.week.trained) return null;
  const t = tr(state), p = state.player, rng = new RNG(state.rng);
  const v = p.attrs[key];
  const need = sessionsFor(v);
  const quality = rng.pick([0.7, 1, 1, 1, 1.3]);              // Tagesform im Training
  const labels = { 0.7: 'Zähe Einheit', 1: 'Solides Training', 1.3: 'Starke Einheit' };
  t.progress[key] = (t.progress[key] ?? 0) + quality / need;
  let up = false;
  if (t.progress[key] >= 1 && v < 100) { p.attrs[key] = v + 1; t.progress[key] -= 1; up = true; }
  state.week.trained = key;
  t.idle = 0; t.sessions++;
  const label = ATTRS.find(a => a.key === key).label;
  if (up) addNews(state, 'xp', `Training: ${label} steigt auf ${p.attrs[key]}`, 'Regelmäßiges Training zahlt sich aus.');
  return { gain: quality / need, up, text: labels[quality], progress: clamp(t.progress[key], 0, 1), need };
}

// Am Wochenende (vor dem Wechsel): Trainingspause zählen, ggf. Formverlust
export function trainingWeekEnd(state) {
  const t = tr(state), p = state.player;
  if (state.week.trained) return null;
  t.idle++;
  if (t.idle < DECAY_AFTER) return null;
  const rng = new RNG(state.rng);
  const risk = clamp(0.15 + (t.idle - DECAY_AFTER) * 0.05, 0, 0.4);
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
