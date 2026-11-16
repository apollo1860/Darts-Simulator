// Karte nach der Profilerstellung: Tourcard-Start
import { card } from '../frame.js';
import { esc } from '../../../util.js';

export const nsd = true;
export function render(app) {
  const p = app.state.player;
  if (p.real) return card(`Du bist ${esc(p.name)}! Deine Tourcard gilt bis Ende ${p.cardUntil}${p.cardVia?.startsWith('Q-School') ? '' : ', Ranglistenplatz und Preisgeld der letzten Jahre bringst du mit'}. Star-Status ${p.star.level} – zeig, was du kannst!`);   // Version 98/99: realer Spieler
  return card(`Glückwunsch, ${esc(p.first)}! Über die Q-School hast du dir eine Tourcard für 2 Jahre erspielt – gültig für die Saisons ${p.cardUntil - 1} und ${p.cardUntil}. Auf dem Papier gehörst du zu den schwächsten Spielern der Tour. Trainiere, spiele und werde zum Star!`);
}
export function mount(root, app) { root.querySelector('#nsd-ok').onclick = () => app.go(app.state.player.assessed ? 'hub' : 'placement'); }
