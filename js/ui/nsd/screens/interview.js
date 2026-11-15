// Interview: nach großen Ergebnissen (Reporter) und vor jeder WM (Elmar Paulke). Antworten gemischt, Wirkung je nach Lage und Stimmung.
import { esc } from '../../../util.js';
import { RNG } from '../../../rng.js';
import { answerInterview, interviewView, ivQuestion, ivIntro } from '../../../career.js';
import { frame, titleBand, bar, checkIcon, arrowIcon } from '../frame.js';
import { toast } from '../../components.js';

export const nsd = true;
const PLACE = { W: 'Turniersieg', F: 'Finale', SF: 'Halbfinale', WM: 'vor dem ersten Match', NQ: 'nicht qualifiziert' };
const FX = [['fans', 'Fans'], ['star', 'Status'], ['manager', 'Manager'], ['sponsors', 'Sponsoren'], ['partner', 'Freundin'], ['mom', 'Selbstvertrauen'], ['sat', 'Zufriedenheit'], ['nerves', 'WM-Nervosität']];
const num = v => `${v > 0 ? '+' : '−'}${String(Math.abs(v)).replace('.', ',')}`;
// Nervosität: weniger ist gut → Farben umgekehrt
const fxList = fx => FX.filter(([k]) => fx?.[k]).map(([k, l]) => `<span class="${(k === 'nerves' ? -fx[k] : fx[k]) > 0 ? 'pos' : 'neg'}">${l} ${num(fx[k])}</span>`).join('');

export function render(app, params = {}) {
  const s = app.state, iv = interviewView(s, new RNG(s.rng));
  if (!iv) return frame({ body: titleBand('Interview'), bottom: bar([null, null, { id: 'iv-end', icon: checkIcon(), wide: true }]) });
  const paulke = iv.kind === 'paulke', last = params.last, done = iv.answers.length >= iv.qs.length, q = done ? null : ivQuestion(iv);
  const who = paulke ? 'Elmar Paulke' : 'Reporter';
  return frame({
    body: `${titleBand(paulke ? '🎤 Interview mit Elmar Paulke' : '🎤 Interview')}<div class="nsd-card nsd-life nsd-iv">
      <div class="nsd-ev-sub">${esc(iv.event)} · ${PLACE[iv.place] ?? ''}${done ? '' : ` · Frage ${iv.answers.length + 1}/${iv.qs.length}`}</div>
      ${!iv.answers.length && !last ? `<div class="iv-intro">${esc(ivIntro(iv))}</div><div class="iv-hint">Keine Antwort ist immer richtig – Lage und Stimmung entscheiden mit.${paulke && iv.qualified ? ' Deine Antworten wirken auch auf die Nervosität bei der WM.' : ''}</div>` : ''}
      ${last ? `<div class="iv-react">${esc(last.txt)}</div><div class="iv-fx">${fxList(last.fx) || '<span>keine spürbare Wirkung</span>'}</div>` : ''}
      ${done ? `<div class="txt">${who}: „Danke für das Gespräch – viel Erfolg!“</div><div class="iv-sum"><b>Gesamt</b><div class="iv-fx">${fxList(iv.sum) || '<span>neutral</span>'}</div></div>`
        : `<div class="txt"><b>${who}:</b> „${esc(q.q)}“</div><div class="opts">${q.a.map((a, i) => `<button class="nsd-btn" data-a="${i}"><span class="lb">${esc(a.t)}</span></button>`).join('')}</div>`}
    </div>`,
    bottom: done ? bar([null, null, { id: 'iv-end', icon: paulke ? arrowIcon() : checkIcon(), label: paulke ? 'Zur WM-Woche' : '', wide: true }]) : '',
  });
}
export function mount(root, app) {
  const s = app.state;
  root.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
    try { const last = answerInterview(s, +b.dataset.a, new RNG(s.rng)); app.save(); app.go('interview', { last }); } catch (e) { toast(e.message, 'error'); }
  });
  root.querySelector('#iv-end')?.addEventListener('click', () => {
    const paulke = s.interview?.kind === 'paulke';
    s.interview = null; app.save();
    if (paulke) return app.go('week');
    app.go(s.articles?.length ? 'news' : 'hub', { article: true });
  });
}
