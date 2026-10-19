// Lebens-Ereignis als Karte: Situation + Optionen → Ergebnis mit Änderungen
import { esc } from '../../../util.js';
import { RNG } from '../../../rng.js';
import { lifeEventView, resolveLifeEvent } from '../../../life.js';
import { frame, titleBand, bar, coin } from '../frame.js';
import { toast } from '../../components.js';

export const nsd = true;
export function render(app, params = {}) {
  const s = app.state;
  if (params.result) {
    const r = params.result;
    return frame({
      body: `${titleBand('Ereignis')}<div class="nsd-card nsd-life"><div class="txt">${esc(r.text)}</div>
        ${r.changes.length ? `<div class="chg">${r.changes.map(c => `<span>${esc(c)}</span>`).join('')}</div>` : ''}</div>`,
      bottom: bar([null, null, { id: 'le-ok', icon: '<span class="nsd-check">✔</span>', wide: true }]),
    });
  }
  const v = lifeEventView(s);
  if (!v) return frame({ body: `${titleBand('Ereignis')}<div class="nsd-card">Nichts los.</div>`, bottom: bar([null, null, { id: 'le-ok', icon: '<span class="nsd-check">✔</span>', wide: true }]) });
  return frame({
    body: `${titleBand('Ereignis')}<div class="nsd-card nsd-life"><div class="ic">${v.icon}</div><div class="txt">${esc(v.text)}</div>
      <div class="opts">${v.opts.map(o => `<button class="nsd-btn" data-o="${o.i}" ${o.cost > (s.stars ?? 0) || o.tired ? 'disabled' : ''}><span class="lb">${esc(o.label)}${o.cost ? ` ${coin(o.cost)}` : ''}${o.energy ? ` · −${o.energy} % ⚡` : ''}</span></button>`).join('')}</div></div>`,
  });
}
export function mount(root, app, params = {}) {
  const s = app.state, back = params.back ?? 'hub';
  root.querySelector('#le-ok')?.addEventListener('click', () => app.go(back));
  root.querySelectorAll('[data-o]').forEach(b => b.onclick = () => {
    try { const result = resolveLifeEvent(s, +b.dataset.o, new RNG(s.rng)); app.save(); app.go('lifeevent', { result, back }); }
    catch (e) { toast(e.message, 'error'); }
  });
}
