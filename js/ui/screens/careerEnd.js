// Karriereende: Abschlussbilanz
import { esc, fmtEUR, fmtNum, fmtPct } from '../../util.js';
import { placeLabel } from '../../tournaments.js';
import { START_YEAR } from '../../state.js';
import { avgOf, coOf } from './stats.js';
import { futCard } from '../components.js';

const ORDER = ['W', 'CARD', 'F', 'SF', 'QF', 'L16', 'L32', 'L64', 'L128'];

export function render(app) {
  const s = app.state, c = s.stats.career;
  const best = [...s.results].sort((a, b) => ORDER.indexOf(a.place) - ORDER.indexOf(b.place) || b.prize - a.prize)[0];
  const years = s.date.year - START_YEAR + 1;
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
      </div>
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
