// Karriereende: Abschlussbilanz
import { esc, fmtEUR, fmtNum, fmtPct } from '../../util.js';
import { placeLabel } from '../../tournaments.js';
import { START_YEAR } from '../../state.js';
import { avgOf, coOf } from './stats.js';
import { futCard, catTag } from '../components.js';
import { archiveOf, PLACE_ORDER } from '../../history.js';
import { expLabel } from '../../player.js';


export function render(app) {
  const s = app.state, c = s.stats.career;
  const idx = k => { const i = PLACE_ORDER.indexOf(k); return i < 0 ? 99 : i; };
  const best = [...s.results].filter(r => r.place !== 'NQ' && r.place !== 'QUAL').sort((a, b) => idx(a.place) - idx(b.place) || b.prize - a.prize)[0];
  const years = s.date.year - START_YEAR + 1;
  const a = archiveOf(s), majors = a.titles.filter(t => t.cat === 'major');
  const kpi = (l, v, cls = '') => `<div class="kpi"><div class="label">${l}</div><div class="v num ${cls}">${v}</div></div>`;
  return `<div class="menu-hero" style="padding-bottom:12px"><div class="label">Karriereende</div><h1 style="font-size:clamp(2.4rem,9vw,4rem)">Danke, ${esc(s.player.name.split(' ')[0])}!</h1>
    <div class="tagline">${years} Saison${years > 1 ? 's' : ''} · ${START_YEAR}–${s.date.year}</div></div>
  <div class="two-col card-left">
    <div class="card-stage">${futCard(s.player, { me: true })}</div>
    <div class="stack">
      <div class="kpi-grid">
        ${kpi('Titel', c.titles, 'gold')}
        ${kpi('Preisgeld gesamt', fmtEUR(s.finance.prizeTotal), 'gold')}
        ${kpi('Matches', `${c.wins}–${c.matches - c.wins}`)}
        ${kpi('Average', c.darts ? fmtNum(avgOf(c), 2) : '–', 'cyan')}
        ${kpi('180er', c.s180)}
        ${kpi('Checkout', c.coAtt ? fmtPct(coOf(c)) : '–')}
        ${kpi('Höchstes Finish', c.hiFinish || '–')}
        ${kpi('Turniere', c.events)}
        ${kpi('Beste PDC-Platzierung', a.peak.pdc ? `#${a.peak.pdc.rank}` : '–', 'cyan')}
        ${kpi('Major-Titel', majors.length, 'gold')}
        ${kpi('Sponsor-Einnahmen', fmtEUR(s.sponsors.total ?? 0))}
        ${kpi('Erfahrung', expLabel(s.player.exp ?? 0))}
      </div>
      ${a.titles.length ? `<div class="panel"><div class="label">Titel</div>${a.titles.slice(0, 12).map(t => `<div style="margin-top:4px">${catTag(t.cat)} ${esc(t.name)} <span class="muted">${t.year}</span></div>`).join('')}${a.titles.length > 12 ? `<div class="muted" style="margin-top:4px">… und ${a.titles.length - 12} weitere</div>` : ''}</div>` : ''}
      <div class="panel"><div class="label">Bestplatzierung</div>
        <div style="font-weight:700;margin-top:4px">${best ? `${placeLabel(best.place)} – ${esc(best.name)} (${best.year})` : 'Keine Turniere gespielt'}</div></div>
      <div class="row">
        <button class="btn btn-primary" id="b-new">Neue Karriere</button>
        <button class="btn btn-ghost" id="b-menu">Hauptmenü</button>
      </div>
    </div>
  </div>`;
}

export function mount(root, app) {
  root.querySelector('#b-new').onclick = () => { app.state = null; app.go('create'); };
  root.querySelector('#b-menu').onclick = () => { app.state = null; app.go('menu'); };
}
