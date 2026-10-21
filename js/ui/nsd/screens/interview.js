// Interview nach großen Ergebnissen: 3 Fragen, je bescheiden / selbstbewusst / großspurig
import { esc } from '../../../util.js';
import { RNG } from '../../../rng.js';
import { INTERVIEW_QS } from '../../../../data/team.js';
import { answerInterview } from '../../../career.js';
import { frame, titleBand, bar, checkIcon } from '../frame.js';
import { toast } from '../../components.js';

export const nsd = true;
const PLACE = { W: 'Turniersieg', F: 'Finale', SF: 'Halbfinale' };
export function render(app, params = {}) {
  const iv = app.state.interview;
  if (!iv) return frame({ body: titleBand('Interview'), bottom: bar([null, null, { id: 'iv-end', icon: checkIcon(), wide: true }]) });
  const last = params.last, done = iv.answers.length >= iv.qs.length, q = INTERVIEW_QS[iv.qs[iv.answers.length]];
  return frame({
    body: `${titleBand('🎤 Interview')}<div class="nsd-card nsd-life">
      <div class="nsd-ev-sub">${esc(iv.event)} · ${PLACE[iv.place] ?? ''}</div>
      ${last ? `<div class="chg"><span>${esc(last.txt)}</span><span>Fans ${last.fans >= 0 ? '+' : ''}${last.fans}</span></div>` : ''}
      ${done ? `<div class="txt">Danke für das Gespräch!</div><div class="chg"><span>Star-Status +${iv.total}</span></div>`
        : `<div class="txt">„${esc(q.q)}“</div><div class="opts">${q.a.map((a, i) => `<button class="nsd-btn" data-a="${i}"><span class="lb">${esc(a)}</span></button>`).join('')}</div>`}
    </div>`,
    bottom: done ? bar([null, null, { id: 'iv-end', icon: checkIcon(), wide: true }]) : '',
  });
}
export function mount(root, app) {
  const s = app.state;
  root.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
    try { const last = answerInterview(s, +b.dataset.a, new RNG(s.rng)); app.save(); app.go('interview', { last }); } catch (e) { toast(e.message, 'error'); }
  });
  root.querySelector('#iv-end')?.addEventListener('click', () => {
    s.interview = null; app.save();
    app.go(s.articles?.length ? 'news' : 'hub', { article: true });
  });
}
