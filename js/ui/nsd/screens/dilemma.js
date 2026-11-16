// Dilemma (Version 107): zwei Lebensbereiche, du entscheidest dich für einen – der gewinnt ein paar Prozent, der andere verliert etwas
import { esc } from '../../../util.js';
import { RNG } from '../../../rng.js';
import { dilemmaAct, resolveDilemma } from '../../../career.js';
import { relLabelOf } from '../../../nsd.js';
import { dilemmaArt } from '../art/dilemma.js';
import { frame, titleBand, darkBar, meter, bar, checkIcon } from '../frame.js';
import { toast } from '../../components.js';

export const nsd = true;
const plural = key => key === 'fans' || key === 'sponsors';
const label = (p, key) => (key === 'partner' && p.partnerName ? p.partnerName : relLabelOf(p, key));

export function render(app, params = {}) {
  const s = app.state, p = s.player, r = params.result, d = r ?? s.dilemma;
  if (!d) return frame({ body: `${titleBand('Entscheidung')}<div class="nsd-card">Nichts zu entscheiden.</div>`, bottom: bar([null, null, { id: 'dl-ok', icon: checkIcon(), wide: true }]) });
  const panel = (o, i) => {
    const act = dilemmaAct(o), k = o.key, chosen = r && r.chosen === i;
    const pct = r ? r.after[k] : p.rel[k] ?? 0, from = r ? r.before[k] : null;
    const delta = r ? (chosen ? `+${r.gain}` : `−${r.loss}`) : '';
    return `<button class="nsd-dl ${i ? 'right' : 'left'} ${r ? (chosen ? 'won' : 'lost') : ''}" data-dl="${i}" ${r ? 'disabled' : ''}>
      <div class="pic">${dilemmaArt(act.art)}<span class="cap">${esc(act.label)}</span>${delta ? `<span class="dlt">${delta}</span>` : ''}</div>
      ${meter({ label: esc(label(p, k)), pct, from, tone: 'green' })}</button>`;
  };
  return frame({
    body: `${titleBand('Entscheidung')}${darkBar(r ? `${esc(label(p, d.opts[r.chosen].key))} ${plural(d.opts[r.chosen].key) ? 'freuen' : 'freut'} sich – ${esc(label(p, d.opts[1 - r.chosen].key))} ${plural(d.opts[1 - r.chosen].key) ? 'sind' : 'ist'} enttäuscht` : 'Wofür nimmst du dir diese Woche Zeit?', 'sm')}
      <div class="nsd-dls">${d.opts.map(panel).join('')}</div>`,
    bottom: r ? bar([null, null, { id: 'dl-ok', icon: checkIcon(), wide: true }]) : '',
  });
}
export function mount(root, app, params = {}) {
  const s = app.state, back = params.back ?? 'hub';
  root.querySelector('#dl-ok')?.addEventListener('click', () => app.go(back));
  root.querySelectorAll('[data-dl]').forEach(b => b.onclick = () => {
    if (params.result) return;
    try { const result = resolveDilemma(s, +b.dataset.dl, new RNG(s.rng)); app.save(); app.go('dilemma', { result, back }); }
    catch (e) { toast(e.message, 'error'); }
  });
}
