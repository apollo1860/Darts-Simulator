// Karte nach der Profilerstellung: Tourcard-Start
import { card } from '../frame.js';
import { esc } from '../../../util.js';

export const nsd = true;
export function render(app) {
  const p = app.state.player;
  if (p.real) return card(p.tour === 'tour'   // Version 98: realer Spieler
    ? `Du bist ${esc(p.name)}! Deine Tourcard gilt bis Ende ${p.cardUntil}, Ranglistenplatz und Preisgeld der letzten Jahre bringst du mit. Star-Status ${p.star.level} – zeig, was du kannst!`
    : `Du bist ${esc(p.name)}! Ohne Tourcard geht es über die Challenge Tour${p.age <= 23 ? ' und die Development Tour' : ''} – und jedes Jahr in KW 2 über die Q-School zurück auf die große Bühne.`);
  return card(`Glückwunsch, ${esc(p.first)}! Über die Q-School hast du dir eine Tourcard für 2 Jahre erspielt – gültig für die Saisons ${p.cardUntil - 1} und ${p.cardUntil}. Auf dem Papier gehörst du zu den schwächsten Spielern der Tour. Trainiere, spiele und werde zum Star!`);
}
export function mount(root, app) { root.querySelector('#nsd-ok').onclick = () => app.go(app.state.player.assessed ? 'hub' : 'placement'); }
