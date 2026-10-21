// Freies Training (Titelmenü): Minispiele ohne Karriere, Level frei wählbar
import { TRAINABLE, SKILL_LEVELS } from '../../../nsd.js';
import { frame, titleBand, darkBar, bar, arrowIcon } from '../frame.js';

export const nsd = true;
let pick = { key: 'sco', level: 1 };
export function render() {
  return frame({
    body: `${titleBand('Freies Training')}${darkBar('Ohne Karriere – nur zum Üben', 'sm')}
      <div class="nsd-seg nsd-prac-skills">${TRAINABLE.map(t => `<button class="nsd-btn ${pick.key === t.key ? 'on' : ''}" data-k="${t.key}"><span class="ic">${t.icon}</span><span class="lb">${t.label}</span></button>`).join('')}</div>
      <div class="nsd-lvls">${Array.from({ length: SKILL_LEVELS }, (_, i) => `<button class="nsd-lvl ${pick.level === i + 1 ? 'next' : ''}" data-l="${i + 1}"><b>${i + 1}</b></button>`).join('')}</div>`,
    bottom: bar([{ go: 'title', icon: arrowIcon(true), label: 'Zurück' }, null, { id: 'pr-go', icon: arrowIcon(), label: 'Los', wide: true }]),
  });
}
export function mount(root, app) {
  root.querySelectorAll('[data-k]').forEach(b => b.onclick = () => { pick.key = b.dataset.k; app.refresh(); });
  root.querySelectorAll('[data-l]').forEach(b => b.onclick = () => { pick.level = +b.dataset.l; app.refresh(); });
  root.querySelector('#pr-go').onclick = () => app.go('minigame', { ...pick, mode: 'practice' });
}
