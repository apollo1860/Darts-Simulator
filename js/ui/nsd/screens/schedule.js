// Spielplan: alle Wochen der Saison mit deinen Turnieren, Status (gespielt, offen, nicht qualifiziert) und Ergebnis
import { esc } from '../../../util.js';
import { flag } from '../../../../data/nations.js';
import { yearSchedule, shownTo } from '../../../calendar.js';
import { eligibility, placeLabel } from '../../../tournaments.js';
import { frame, header, titleBand, coin, bar, bindHead, arrowIcon } from '../frame.js';

export const nsd = true;
const HELP = '<p>Alle Turniere der Saison. <b>Grün</b> = du bist dabei bzw. darfst dich melden, <b>grau</b> = (noch) nicht qualifiziert. Majors, European Tour und Premier League hängen von den Ranglisten ab – die Felder stehen erst in der Turnierwoche fest.</p>';

export function render(app) {
  const s = app.state, y = s.date.year, now = s.date.week;
  const res = (s.results ?? []).filter(r => r.year === y);
  const rows = yearSchedule(s, y).map(({ week, events }) => {
    const evs = events.filter(e => shownTo(s, e) && e.startsThisWeek !== false);
    if (!evs.length) return '';
    const past = week < now, cur = week === now;
    return `<div class="nsd-sched ${past ? 'past' : ''} ${cur ? 'cur' : ''}" ${cur ? 'id="sc-now"' : ''}>
      <div class="kw">KW<b>${week}</b></div>
      <div class="evs">${evs.map(e => {
        const r = res.find(x => x.week === week && (x.eventId === e.id || x.name.startsWith(e.name.split(' & ')[0])));
        const ok = !past && eligibility(s, e).ok;
        const tag = r ? `<span class="res">${esc(placeLabel(r.place, r.cat, r.eventId))}${r.stars ? ` ${coin(r.stars)}` : ''}</span>`
          : past ? '' : `<span class="st ${ok ? 'ok' : ''}">${ok ? 'offen' : 'nicht qualifiziert'}</span>`;
        return `<div class="ev"><span class="nm">${flag(e.country)} ${esc(e.name)}</span>${tag}</div>`;
      }).join('')}</div></div>`;
  }).join('');
  return frame({
    cls: 'fixed',
    body: `${header(s.player.name)}${titleBand(`Spielplan ${y}`)}<div class="nsd-scroll" id="sc-scroll">${rows}</div>`,
    bottom: bar([{ go: 'hub', icon: '🏠', label: 'Start' }, { go: 'league', icon: '🏆', label: 'Ranglisten' }, { go: 'week', icon: arrowIcon(), label: 'Diese Woche', wide: true }]),
  });
}
export function mount(root, app) {
  bindHead(root, app, HELP);
  const el = root.querySelector('#sc-now'), sc = root.querySelector('#sc-scroll');
  if (el && sc) sc.scrollTop = el.offsetTop - sc.offsetTop - 8;
}
