// Rivale: Vergleich du vs. Rivale, Kopf-an-Kopf-Bilanz, letzte Duelle
import { esc, fmtNum } from '../../util.js';
import { flag } from '../../../data/nations.js';
import { overall, targetAverage } from '../../player.js';
import { tourStatus } from '../../world.js';
import { rankOf } from '../../rankings.js';
import { rivalOf } from '../../rival.js';
import { topbar, futCard } from '../components.js';

const rankLine = (s, id, p) => {
  const y = s.date.year, card = id === 'P' ? p.tour === 'tour' : p.tier === 'tour';
  if (card) return `PDC ${rankOf(s, 'pdc', id, y) ?? '–'}`;
  const ct = rankOf(s, 'challenge', id, y);
  return ct ? `CT ${ct}` : '–';
};
// Titel ohne lokale Turniere (Titelträger-Liste)
const titlesOf = (s, id) => Object.values(s.champions ?? {}).flat().filter(c => c.id === id).length;

export function render(app) {
  const s = app.state, r = rivalOf(s), rv = s.rival, p = s.player;
  if (!r) return `${topbar({ title: 'Rivale' })}<div class="panel">Kein Rivale.</div>`;
  const row = (label, a, b, better = 0) => `<tr><td class="r num ${better > 0 ? 'pos' : ''}">${a}</td><td class="center muted">${label}</td><td class="num ${better < 0 ? 'pos' : ''}">${b}</td></tr>`;
  const oP = overall(p.attrs), oR = overall(r.attrs);
  const aP = targetAverage(p.attrs), aR = r.avg;
  const tP = titlesOf(s, 'P'), tR = titlesOf(s, r.id);
  return `${topbar({ title: 'Rivale', sub: `${esc(r.name)} · ${r.age} Jahre · ${esc(tourStatus(r))}` })}
  <div class="rival-head">
    <div class="center">${futCard(p, { small: true, me: true })}<div class="label" style="margin-top:6px">Du</div></div>
    <div class="rival-vs"><div class="label">Direkte Bilanz</div><div class="rival-score">${rv.w}<span>:</span>${rv.l}</div>
      <div class="muted" style="font-size:.78rem">${rv.w + rv.l ? (rv.w > rv.l ? 'Du führst' : rv.w < rv.l ? `${esc(r.name.split(' ').pop())} führt` : 'Ausgeglichen') : 'Noch kein Duell'}</div></div>
    <div class="center">${futCard(r, { small: true })}<div class="label" style="margin-top:6px">${flag(r.nation)} ${esc(r.name.split(' ').pop())}</div></div>
  </div>
  <div class="panel table-wrap"><table class="table rival-cmp">
    ${row('Gesamt', oP, oR, oP - oR)}
    ${row('Ø-Niveau', fmtNum(aP, 1), fmtNum(aR, 1), aP - aR)}
    ${row('Erfahrung', p.exp, r.exp ?? 0, p.exp - (r.exp ?? 0))}
    ${row('Status', esc(tourStatus(p, s.date.year)), esc(tourStatus(r)))}
    ${row('Rangliste', rankLine(s, 'P', p), rankLine(s, r.id, r))}
    ${row('Titel (ohne lokal)', tP, tR, tP - tR)}
  </table></div>
  <div class="section-title"><span class="label">Duelle</span></div>
  <div class="panel table-wrap">${rv.meetings.length ? `<table class="table">${rv.meetings.map(m => `<tr>
      <td class="muted" style="white-space:nowrap">KW ${m.week}/${m.year}</td><td>${esc(m.event)}<div class="muted" style="font-size:.75rem">${esc(m.round)}</div></td>
      <td class="r num"><b class="${m.won ? 'pos' : 'neg'}">${m.won ? 'S' : 'N'} ${esc(m.score)}</b></td></tr>`).join('')}</table>`
    : '<div class="muted">Noch kein Aufeinandertreffen. Lokale Turniere, DDV, WDF, Q-School und die Challenge/Dev Tour – irgendwann kreuzen sich eure Wege.</div>'}</div>`;
}
