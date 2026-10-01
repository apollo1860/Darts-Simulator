// Tour-Übersicht: Tourcard-Holder (Gültigkeit, Herkunft) und Titelträger (aktuelle Sieger je Major, Siegerliste je Saison)
import { esc } from '../../util.js';
import { flag } from '../../../data/nations.js';
import { CALENDAR } from '../../../data/tournaments.js';
import { orderOfMerit } from '../../rankings.js';
import { getPlayer } from '../../world.js';
import { topbar, playerModal, catTag } from '../components.js';

let tab = 'holder', filter = 'all', year = null;

// Titel-Events in Kalenderreihenfolge (Majors, World Series, PL-Play-offs, Youth-WM)
const TITLE_EVENTS = CALENDAR.filter(e => ['major', 'ws', 'pl'].includes(e.cat) && !e.plNight && e.id !== 'wm-quali' || e.id === 'youth-wm')
  .sort((a, b) => a.week - b.week);

const originKey = via => !via ? 'other' : via.startsWith('Top 64') ? 'top64' : via.startsWith('Q-School') ? 'qschool' : 'tour';
const FILTERS = [['all', 'Alle'], ['exp', 'Läuft aus'], ['top64', 'Top 64'], ['qschool', 'Q-School'], ['tour', 'CT/Dev']];

function holders(s) {
  const y = s.date.year;
  return orderOfMerit(s, 'pdc').map(x => ({ ...x, until: x.p.id === 'P' ? s.player.cardUntil : x.p.cardUntil, via: x.p.cardVia }))
    .filter(x => filter === 'all' || (filter === 'exp' ? x.until <= y : originKey(x.via) === filter));
}

function renderHolder(s) {
  const list = holders(s), y = s.date.year;
  return `<div class="filter-row">${FILTERS.map(([k, l]) => `<button class="chip ${filter === k ? 'active' : ''}" data-f="${k}">${l}</button>`).join('')}</div>
  <div class="panel muted" style="margin-bottom:12px;font-size:.84rem">Tourcard gilt 2 Jahre. Wer am Saisonende in den Top 64 der PDC OOM steht, bekommt 1 Jahr dazu. „Läuft aus“: Karte endet ${y} – nur Top 64 behalten sie.</div>
  <div class="panel table-wrap"><table class="table">
    <tr><th>#</th><th>Spieler</th><th class="r">Karte bis</th></tr>
    ${list.map(x => `<tr class="clickable ${x.p.id === 'P' ? 'me' : ''}" data-pl="${x.p.id}"><td class="num">${x.rank}</td>
      <td>${flag(x.p.nation)} ${esc(x.p.name)}<div class="muted" style="font-size:.74rem">${esc(x.via ?? '–')}</div></td><td class="r num" ${x.until <= y ? 'style="color:var(--red)"' : ''}>${x.until ?? '–'}</td></tr>`).join('') || '<tr><td colspan="3" class="muted">Keine Spieler.</td></tr>'}
  </table></div>
  <div class="muted" style="font-size:.8rem;margin-top:6px">${list.length} Spieler · # = Platz PDC OOM</div>`;
}

const who = c => `${c.nation ? flag(c.nation) + ' ' : ''}${esc(c.who)}`;

function renderTitles(s) {
  const champs = s.champions ?? {};
  const years = Object.keys(champs).map(Number).sort((a, b) => b - a);
  const latest = id => { for (const y of years) { const c = champs[y].findLast(x => x.eventId === id); if (c) return { ...c, year: y }; } return null; };
  const sel = year ?? years[0];
  const season = (champs[sel] ?? []).filter(c => !TITLE_EVENTS.some(e => e.id === c.eventId));
  return `<div class="section-title"><span class="label">Aktuelle Titelträger</span></div>
  <div class="panel table-wrap"><table class="table">
    <tr><th>Turnier</th><th>Titelträger</th><th class="r">Jahr</th></tr>
    ${TITLE_EVENTS.map(e => { const c = latest(e.id); return `<tr ${c ? `class="clickable ${c.id === 'P' ? 'me' : ''}" data-pl="${c.id}"` : ''}>
      <td>${catTag(e.cat)} ${esc(e.name)}</td><td>${c ? who(c) : '<span class="muted">noch offen</span>'}</td><td class="r num">${c?.year ?? '–'}</td></tr>`; }).join('')}
  </table></div>
  ${years.length ? `<div class="section-title"><span class="label">Alle Sieger</span></div>
  <div class="filter-row">${years.map(y => `<button class="chip ${y === sel ? 'active' : ''}" data-y="${y}">${y}</button>`).join('')}</div>
  <div class="panel table-wrap"><table class="table">
    <tr><th class="r">KW</th><th>Turnier</th><th>Sieger</th></tr>
    ${season.slice().reverse().map(c => `<tr class="clickable ${c.id === 'P' ? 'me' : ''}" data-pl="${c.id}"><td class="r num">${c.week}</td>
      <td>${catTag(c.cat)} ${esc(c.name)}</td><td>${who(c)}</td></tr>`).join('') || '<tr><td colspan="3" class="muted">Noch keine Turniere.</td></tr>'}
  </table></div>` : '<div class="muted" style="margin-top:8px;font-size:.84rem">Titelträger werden ab Karrierestart erfasst.</div>'}`;
}

export function render(app) {
  const s = app.state;
  return `${topbar({ title: 'Tour', sub: `Tourcard-Holder & Titelträger · ${s.date.year}` })}
  <div class="filter-row"><button class="chip ${tab === 'holder' ? 'active' : ''}" data-t="holder">🎫 Tourcard-Holder</button>
    <button class="chip ${tab === 'titles' ? 'active' : ''}" data-t="titles">🏆 Titelträger</button></div>
  ${tab === 'holder' ? renderHolder(s) : renderTitles(s)}`;
}

export function mount(root, app) {
  root.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tab = b.dataset.t; app.refresh(); });
  root.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { filter = b.dataset.f; app.refresh(); });
  root.querySelectorAll('[data-y]').forEach(b => b.onclick = () => { year = +b.dataset.y; app.refresh(); });
  root.querySelectorAll('[data-pl]').forEach(r => r.onclick = () => {
    const p = getPlayer(app.state, r.dataset.pl);
    if (p && !String(r.dataset.pl).startsWith('W:')) playerModal(p, r.dataset.pl === 'P');
  });
}
