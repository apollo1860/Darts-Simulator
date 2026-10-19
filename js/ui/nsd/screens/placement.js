// Einstufung nach der Profilerstellung: jedes Minispiel einmal auf Level 1 (ohne Energie) → Startwerte
import { TRAINABLE, skillValue } from '../../../nsd.js';
import { addNews } from '../../../news.js';
import { card } from '../frame.js';
import { esc } from '../../../util.js';

export const nsd = true;
export function render(app, params = {}) {
  const step = params.step ?? -1, p = app.state.player;
  if (step < 0) return card(`Einstufung: Zeig uns, was du kannst! Du spielst jedes Training einmal auf Level 1 – ${TRAINABLE.map(t => t.label).join(', ')}. Das Ergebnis ist dein Startwert. Kostet keine Energie.`);
  if (step < TRAINABLE.length) return card(`${TRAINABLE[step].icon} ${esc(TRAINABLE[step].label)} (${step + 1}/${TRAINABLE.length})`);
  return card(`Einstufung abgeschlossen!<br><br>${TRAINABLE.map(t => `${t.icon} ${t.label}: <b>${skillValue(p, t.key)}</b>`).join('<br>')}<br><br>Trainiere weiter, um besser zu werden.`);
}
export function mount(root, app, params = {}) {
  const step = params.step ?? -1, s = app.state;
  root.querySelector('#nsd-ok').onclick = () => {
    if (step < 0) return app.go('placement', { step: 0 });
    if (step < TRAINABLE.length) return app.go('minigame', { key: TRAINABLE[step].key, level: 1, mode: 'placement', step });
    if (!s.player.assessed) {
      s.player.assessed = true;
      addNews(s, 'star', 'Einstufung abgeschlossen', TRAINABLE.map(t => `${t.label} ${skillValue(s.player, t.key)}`).join(' · '));
      app.save();
    }
    app.go('hub');
  };
}
