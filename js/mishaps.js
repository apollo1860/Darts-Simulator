// Zufallsereignisse (DOM-frei): zu Wochenbeginn mit 7 % Chance ein Missgeschick.
// Meist (75 %) Trainingsrückschlag: Fortschritt von 1–2 Attributen sinkt um 30–60 %-Punkte.
// Seltener (25 %): Ausfall – diese Woche kann kein Turnier gespielt werden (state.week.blocked).
import { RNG } from './rng.js';
import { ATTRS } from './player.js';
import { addNews } from './news.js';

export const MISHAP_CHANCE = 0.07, BLOCK_SHARE = 0.25;
export const MISHAPS = [
  { id: 'finger', icon: '🤕', label: 'Finger eingequetscht', text: 'Beim Tragen der Sporttasche den Wurffinger in der Autotür eingeklemmt.' },
  { id: 'school', icon: '📚', label: 'Schulische Verpflichtungen', text: 'Klausurphase – Lernen statt Oche.', maxAge: 18 },
  { id: 'tooth', icon: '🦷', label: 'Zahnschmerzen', text: 'Ein Backenzahn meldet sich, Konzentration unmöglich.' },
  { id: 'back', icon: '🧍', label: 'Rückenschmerzen', text: 'Verzogen beim Training – jede Wurfbewegung zieht.' },
  { id: 'cold', icon: '🤧', label: 'Erkältung', text: 'Schnupfen, Kopfweh, Gliederschmerzen.' },
  { id: 'stomach', icon: '🤢', label: 'Magen-Darm-Virus', text: 'Zwei Tage flach gelegen.' },
];

// Zu Beginn jeder neuen Woche (nach advanceWeek)
export function mishapWeek(state) {
  const p = state.player, rng = new RNG(state.rng);
  if (!rng.chance(MISHAP_CHANCE)) return null;
  const m = rng.pick(MISHAPS.filter(x => !x.maxAge || p.age <= x.maxAge));
  if (rng.chance(BLOCK_SHARE)) {
    state.week.blocked = { id: m.id, label: m.label, icon: m.icon };
    addNews(state, 'info', `${m.icon} Ausfall: ${m.label}`, `${m.text} Diese Woche kannst du kein Turnier spielen.`);
    return { ...m, blocked: true };
  }
  const t = (state.training ??= { progress: {}, idle: 0, sessions: 0, lost: 0 });
  const keys = rng.shuffle(ATTRS.map(a => a.key)).slice(0, rng.int(1, 2));
  const hit = keys.map(k => {
    const before = t.progress[k] ?? 0, loss = rng.float(0.3, 0.6);
    t.progress[k] = Math.max(0, before - loss);
    return ATTRS.find(a => a.key === k).label;
  });
  addNews(state, 'info', `${m.icon} ${m.label}`, `${m.text} Trainingsrückschlag bei ${hit.join(' und ')} – der Fortschritt zum nächsten Punkt sinkt.`);
  return { ...m, blocked: false, attrs: keys };
}
