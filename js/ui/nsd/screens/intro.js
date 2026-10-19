// Karte nach der Profilerstellung: Tourcard-Start
import { card } from '../frame.js';
import { esc } from '../../../util.js';

export const nsd = true;
export function render(app) {
  const p = app.state.player;
  return card(`Glückwunsch, ${esc(p.first)}! Über die Q-School hast du dir eine Tourcard erspielt – gültig bis Ende ${p.cardUntil}. Auf dem Papier gehörst du zu den schwächsten Spielern der Tour. Trainiere, spiele und werde zum Star!`);
}
export function mount(root, app) { root.querySelector('#nsd-ok').onclick = () => app.go('hub'); }
