// Jahreskalender (Monatsgruppen, aktuelle Woche markiert)
import { esc, MONTHS, monthOfWeek, weekRange } from '../../util.js';
import { CATEGORIES } from '../../../data/tournaments.js';
import { yearSchedule } from '../../calendar.js';
import { eventStatus } from '../../tournaments.js';
import { flag } from '../../../data/nations.js';
import { topbar, catTag } from '../components.js';

let filter = 'all';

export function render(app, params) {
  const s = app.state;
  const year = params.year ?? s.date.year;
  const sched = yearSchedule(s, year);
  const show = ev => (filter === 'all' ? true : filter === 'me' ? eventStatus(s, ev).eligible : ev.cat === filter)
    && (ev.startsThisWeek !== false);
  const months = {};
  for (const w of sched) (months[monthOfWeek(year, w.week)] ??= []).push(w);
  const chips = [['all', 'Alle'], ['me', 'Für mich'], ...Object.entries(CATEGORIES).map(([k, c]) => [k, c.short])];
  return `${topbar({ title: `Kalender ${year}`, sub: 'Pro Woche ein Event' })}
  <div class="filter-row">${chips.map(([k, l]) => `<button class="chip ${filter === k ? 'active' : ''}" data-f="${k}">${esc(l)}</button>`).join('')}</div>
  ${Object.entries(months).map(([m, weeks]) => `
    <div class="month-block">
      <div class="section-title"><h3>${MONTHS[m]}</h3></div>
      <div class="panel" style="padding:0">
      ${weeks.map(w => {
        const evs = w.events.filter(show);
        const cls = year < s.date.year || (year === s.date.year && w.week < s.date.week) ? 'past'
          : year === s.date.year && w.week === s.date.week ? 'current' : '';
        return `<div class="week-row ${cls}">
          <div class="wk">KW ${w.week}<small>${weekRange(year, w.week).replace(/ \d{4}$/, '')}</small></div>
          <div class="evs">${evs.length ? evs.map(e => `<div class="ev">${catTag(e.cat)}<span class="n">${esc(e.name)}</span><span class="dim" style="font-size:.75rem">${flag(e.country)}</span></div>`).join('') : '<span class="dim" style="font-size:.85rem">–</span>'}</div>
        </div>`;
      }).join('')}
      </div>
    </div>`).join('')}`;
}

export function mount(root, app) {
  root.querySelectorAll('[data-f]').forEach(b => b.onclick = () => { filter = b.dataset.f; app.refresh(); });
  root.querySelector('.week-row.current')?.scrollIntoView({ block: 'center' });
}
