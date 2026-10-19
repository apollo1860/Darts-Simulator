// Meilenstein-Einblendung unten: nacheinander, Tippen schließt, sonst nach 3 s automatisch
import { ACHIEVEMENTS } from '../../../data/achievements.js';
import { esc } from '../../util.js';

let busy = false;
const STAR_CHECK = `<svg viewBox="0 0 64 60"><defs><linearGradient id="msg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6a8"/><stop offset=".45" stop-color="#ffcf2e"/><stop offset="1" stop-color="#f08a00"/></linearGradient></defs>
  <path d="M32 3l8.8 18.9 20.5 2.4-15.2 14.1 4 20.4L32 48.6 13.9 58.8l4-20.4L2.7 24.3l20.5-2.4z" fill="url(#msg)" stroke="#c46a00" stroke-width="2"/>
  <path d="M17 33l10 9 21-22" fill="none" stroke="#0f6b00" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M17 33l10 9 21-22" fill="none" stroke="#3fd12a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export function flushMilestones(app) {
  const s = app.state;
  if (busy || !s?.msQueue?.length || typeof document === 'undefined') return;
  const id = s.msQueue.shift(), a = ACHIEVEMENTS.find(x => x.id === id);
  app.save();
  if (!a) return flushMilestones(app);
  busy = true;
  // Wie bei NSS: über der unteren Leiste – links Stern mit Haken, rechts der Meilenstein
  const el = document.createElement('button');
  el.className = 'nsd-ms-toast';
  el.innerHTML = `<span class="ms-ic">${STAR_CHECK}</span><span class="ms-txt">${esc(a.label)}</span>`;
  const barEl = document.querySelector('.nsd-bar');
  if (barEl) {
    const r = barEl.getBoundingClientRect();
    Object.assign(el.style, { left: `${r.left}px`, top: `${r.top}px`, width: `${r.width}px`, height: `${r.height}px`, bottom: 'auto' });
  }
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
