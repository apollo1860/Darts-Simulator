// Meilenstein-Einblendung unten: nacheinander, Tippen schließt, sonst nach 3 s automatisch
import { ACHIEVEMENTS } from '../../../data/achievements.js';
import { esc } from '../../util.js';

let busy = false;
export function flushMilestones(app) {
  const s = app.state;
  if (busy || !s?.msQueue?.length || typeof document === 'undefined') return;
  const id = s.msQueue.shift(), a = ACHIEVEMENTS.find(x => x.id === id);
  app.save();
  if (!a) return flushMilestones(app);
  busy = true;
  const el = document.createElement('button');
  el.className = 'nsd-ms-toast';
  el.innerHTML = `<span class="ic">${a.icon}</span><span><small>Meilenstein erreicht!</small><b>${esc(a.label)}</b></span>`;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  let done = false;
  const close = () => {
    if (done) return; done = true;
    el.classList.remove('show');
    setTimeout(() => { el.remove(); busy = false; flushMilestones(app); }, 250);
  };
  el.addEventListener('click', close);
  setTimeout(close, 3000);
}
