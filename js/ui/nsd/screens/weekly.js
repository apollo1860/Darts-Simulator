// Wochen-Update nach „Weiter“: Energie, Sponsoren, Trainer, Nachrichten der Woche
import { esc } from '../../../util.js';
import { frame, titleBand, darkBar, coin, bar } from '../frame.js';

export const nsd = true;
export function render(app, params = {}) {
  const s = app.state, w = s.weekly ?? {}, news = params.news ?? [];
  const rows = [
    `<div class="nsd-result-row"><span>Energie</span><b>${w.energy >= 0 ? '+' : ''}${w.energy ?? 0} % → ${s.player.energy} %</b></div>`,
    w.sponsor ? `<div class="nsd-result-row"><span>Sponsoren</span><b>+${coin(w.sponsor)}</b></div>` : '',
    w.fee ? `<div class="nsd-result-row"><span>Fitnesstrainer</span><b>−${coin(w.fee)}</b></div>` : '',
    `<div class="nsd-result-row"><span>Guthaben</span><b>${coin(s.stars ?? 0)}</b></div>`,
  ].join('');
  return frame({
    cls: 'fixed',
    body: `${titleBand(`Woche ${s.date.week} · ${s.date.year}`)}<div class="nsd-scroll"><div class="nsd-result">${rows}</div>
      ${news.length ? darkBar('Neuigkeiten', 'sm') : ''}${news.map(n => `<div class="nsd-news"><div class="ic">📰</div><div><div class="t">${esc(n.title)}</div>${n.text ? `<div class="x">${esc(n.text)}</div>` : ''}</div></div>`).join('')}</div>`,
    bottom: bar([null, null, { id: 'w-ok', icon: '<span class="nsd-check">✔</span>', wide: true }]),
  });
}
export function mount(root, app) {
  root.querySelector('#w-ok').onclick = () => {
    if (app.state.articles?.length) return app.go('news', { article: true, back: 'continue' });   // erst Website-Artikel
    continueWeek(app);
  };
}
// Nach dem Wochen-Update weiter: Karriereende → Saisonbericht → Ereignis → Wochenansicht
export function continueWeek(app) {
  const s = app.state;
  if (s.ended) return app.go('careerEnd');
  if (s.seasonReport && !s.seasonReport.seen) return app.go('season');
  if (s.lifeEvent) return app.go('lifeevent', { back: 'week' });
  app.go('week');
}
