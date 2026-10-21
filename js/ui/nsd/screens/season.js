// Saisonbericht (Jahresende): Bilanz, Ziele, Auszeichnungen
import { esc, fmtNum } from '../../../util.js';
import { frame, titleBand, darkBar, coin, bar, checkIcon } from '../frame.js';

export const nsd = true;
export function render(app) {
  const r = app.state.seasonReport;
  if (!r) return frame({ body: titleBand('Saisonbericht'), bottom: bar([null, null, { id: 's-ok', icon: checkIcon(), wide: true }]) });
  const row = (l, v) => `<div class="nsd-result-row"><span>${l}</span><b>${v}</b></div>`;
  return frame({
    cls: 'fixed',
    body: `${titleBand(`Saisonbericht ${r.year}`)}<div class="nsd-scroll"><div class="nsd-result">
      ${row('Matches', `${r.wins} / ${r.matches} gewonnen`)}${row('Average', r.avg ? fmtNum(r.avg, 2) : '–')}
      ${row('Titel', r.titles.length ? esc(r.titles.join(', ')) : '–')}${row('Bestes Ergebnis', esc(r.best))}
      ${row('Preisgeld', coin(r.stars))}${row('PDC-Rang', r.rank ?? '–')}${row('Star-Status', r.status)}</div>
      ${darkBar('Saisonziele', 'sm')}<div class="nsd-result">${r.goals.map(g => row(esc(g.label), g.ok ? '✅' : '❌')).join('') || row('–', '')}</div>
      ${darkBar('Auszeichnungen', 'sm')}<div class="nsd-result">${r.awards.map(a => `<div class="nsd-result-row ${a.mine ? 'mine' : ''}"><span>🏅 ${esc(a.label)}</span><b>${esc(a.name)}</b></div>`).join('')}</div></div>`,
    bottom: bar([null, null, { id: 's-ok', icon: checkIcon(), wide: true }]),
  });
}
export function mount(root, app) {
  root.querySelector('#s-ok').onclick = () => {
    const s = app.state;
    if (s.seasonReport) s.seasonReport.seen = true;
    app.save();
    if (s.ended) return app.go('careerEnd');
    app.go(s.lifeEvent ? 'lifeevent' : 'goals', s.lifeEvent ? { back: 'goals' } : undefined);
  };
}
