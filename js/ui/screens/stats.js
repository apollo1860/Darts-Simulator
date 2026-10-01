// Statistiken: Karriere, Saisons, Turnierhistorie
import { esc, fmtEUR, fmtNum, fmtPct } from '../../util.js';
import { placeLabel } from '../../tournaments.js';
import { topbar, catTag } from '../components.js';

export const avgOf = t => (t.darts ? t.points / t.darts * 3 : 0);
export const coOf = t => (t.coAtt ? t.coHit / t.coAtt : 0);

export function render(app) {
  const s = app.state, c = s.stats.career;
  const kpi = (l, v, cls = '') => `<div class="kpi"><div class="label">${l}</div><div class="v num ${cls}">${v}</div></div>`;
  const seasons = Object.entries(s.stats.seasons).sort((a, b) => b[0] - a[0]);
  return `${topbar({ title: 'Statistiken', sub: 'Karriere' })}
  <div class="kpi-grid">
    ${kpi('Matches', `${c.wins}–${c.matches - c.wins}`)}
    ${kpi('Siegquote', c.matches ? fmtPct(c.wins / c.matches, 0) : '–')}
    ${kpi('Average', c.darts ? fmtNum(avgOf(c), 2) : '–', 'cyan')}
    ${kpi('Checkout', c.coAtt ? fmtPct(coOf(c)) : '–')}
    ${kpi('180er', c.s180, 'gold')}
    ${kpi('Höchstes Finish', c.hiFinish || '–')}
    ${kpi('Bestes Leg', c.bestLeg ? `${c.bestLeg} Darts` : '–')}
    ${kpi('Titel', c.titles, 'gold')}
    ${kpi('Legs', `${c.legsWon}:${c.legsLost}`)}
    ${kpi('140+ / 100+', `${c.s140} / ${c.s100}`)}
    ${kpi('Turniere', c.events)}
    ${kpi('Preisgeld', fmtEUR(s.finance.prizeTotal), 'gold')}
  </div>
  <div class="section-title"><span class="label">Saisons</span></div>
  <div class="panel table-wrap"><table class="table">
    <tr><th>Saison</th><th class="r">Bilanz</th><th class="r">Average</th><th class="r">180er</th><th class="r">CO %</th><th class="r">Titel</th></tr>
    ${seasons.map(([y, t]) => `<tr><td>${y}</td><td class="r num">${t.wins}–${t.matches - t.wins}</td><td class="r num">${t.darts ? fmtNum(avgOf(t), 2) : '–'}</td>
      <td class="r num">${t.s180}</td><td class="r num">${t.coAtt ? fmtPct(coOf(t)) : '–'}</td><td class="r num">${t.titles}</td></tr>`).join('')}
  </table></div>
  <div class="section-title"><span class="label">Turnierhistorie</span></div>
  <div class="panel table-wrap">${s.results.length ? `<table class="table">
    <tr><th>Datum</th><th>Turnier</th><th>Ergebnis</th><th class="r">Preisgeld</th></tr>
    ${s.results.slice(0, 100).map(r => `<tr><td class="muted" style="white-space:nowrap">KW ${r.week}/${r.year}</td>
      <td>${catTag(r.cat)} ${esc(r.name)}</td><td class="${r.place === 'W' ? 'gold' : ''}">${placeLabel(r.place)}</td><td class="r num">${r.prize ? fmtEUR(r.prize) : '–'}</td></tr>`).join('')}
  </table>` : '<span class="muted">Noch keine Turniere gespielt.</span>'}</div>`;
}
