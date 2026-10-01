// Statistiken: Karriere, Saisons, Turnierhistorie
import { esc, fmtEUR, fmtNum, fmtPct } from '../../util.js';
import { placeLabel } from '../../tournaments.js';
import { topbar, catTag } from '../components.js';
import { archiveOf, PLACE_ORDER } from '../../history.js';
import { CATEGORIES } from '../../../data/tournaments.js';
import { expLabel } from '../../player.js';

const SERIES = { 'cat:pc': 'Players Championships', 'cat:et': 'European Tour', 'cat:challenge': 'Challenge Tour', 'cat:dev': 'Development Tour', 'cat:local': 'Lokale Turniere', 'cat:ddv': 'DDV-Ranglistenturniere', 'cat:plnight': 'Premier League · Spieltage' };

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
  ${archiveSections(s)}
  <div class="section-title"><span class="label">Turnierhistorie</span></div>
  <div class="panel table-wrap">${s.results.length ? `<table class="table">
    <tr><th>Datum</th><th>Turnier</th><th>Ergebnis</th><th class="r">Preisgeld</th></tr>
    ${s.results.slice(0, 100).map(r => `<tr><td class="muted" style="white-space:nowrap">KW ${r.week}/${r.year}</td>
      <td>${catTag(r.cat)} ${esc(r.name)}</td><td class="${r.place === 'W' ? 'gold' : ''}">${placeLabel(r.place)}</td><td class="r num">${r.prize ? fmtEUR(r.prize) : '–'}</td></tr>`).join('')}
  </table>` : '<span class="muted">Noch keine Turniere gespielt.</span>'}</div>`;
}

// Archiv: Höchstplatzierungen, Titel, Bestergebnisse, Saisonbilanzen
function archiveSections(s) {
  const a = archiveOf(s);
  const peak = (k, l) => a.peak[k] ? `<div class="kpi"><div class="label">Beste ${l}</div><div class="v num">#${a.peak[k].rank}</div><div class="muted" style="font-size:.75rem">KW ${a.peak[k].week}/${a.peak[k].year}</div></div>` : '';
  const bests = Object.entries(a.bests).sort((x, y) => PLACE_ORDER.indexOf(x[1].place) - PLACE_ORDER.indexOf(y[1].place));
  const seasons = Object.entries(a.seasons).sort((x, y) => y[0] - x[0]);
  return `
  ${Object.keys(a.peak).length ? `<div class="section-title"><span class="label">Höchstplatzierungen</span></div>
  <div class="kpi-grid">${peak('pdc', 'PDC OOM')}${peak('challenge', 'Challenge OOM')}${peak('dev', 'Dev OOM')}</div>` : ''}
  <div class="section-title"><span class="label">Titel (${a.titles.length})</span></div>
  <div class="panel table-wrap">${a.titles.length ? `<table class="table">${a.titles.map(t => `<tr><td class="muted" style="white-space:nowrap">${t.year}</td>
    <td>${catTag(t.cat)} ${esc(t.name)}</td><td class="r num gold">${t.prize ? fmtEUR(t.prize) : ''}</td></tr>`).join('')}</table>` : '<span class="muted">Noch kein Titel.</span>'}</div>
  ${bests.length ? `<div class="section-title"><span class="label">Bestergebnisse</span></div>
  <div class="panel table-wrap"><table class="table">${bests.map(([k, b]) => `<tr><td>${catTag(b.cat)} ${esc(SERIES[k] ?? b.name ?? k)}</td>
    <td class="${b.place === 'W' ? 'gold' : ''}">${placeLabel(b.place)}</td><td class="r muted">${b.year}</td></tr>`).join('')}</table></div>` : ''}
  ${seasons.length ? `<div class="section-title"><span class="label">Saison-Archiv</span></div>
  <div class="panel table-wrap"><table class="table">
    <tr><th>Saison</th><th>Status</th><th class="r">Rang</th><th class="r">OVR</th><th class="r hide-sm">ERF</th><th class="r">Ø</th><th class="r">Titel</th><th class="r">Preisgeld</th></tr>
    ${seasons.map(([y, x]) => `<tr><td>${y}</td><td style="font-size:.8rem">${esc(x.status)}</td><td class="r num">${x.pdc ? `PDC ${x.pdc}` : x.ct ? `CT ${x.ct}` : '–'}</td>
      <td class="r num">${x.ovr}</td><td class="r num hide-sm">${expLabel(x.exp)}</td><td class="r num">${x.avg ? fmtNum(x.avg, 1) : '–'}</td><td class="r num">${x.titles}</td><td class="r num">${fmtEUR(x.prize)}</td></tr>`).join('')}
  </table></div>` : ''}`;
}
