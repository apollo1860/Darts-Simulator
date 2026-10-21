// Titelträger der Saison (Tour-Turniere seit Karrierestart), eigene Titel grün
import { esc } from '../../../util.js';
import { flag } from '../../../../data/nations.js';
import { frame, header, bar, bindHead } from '../frame.js';
import { NSD_BLOCKED } from '../../../../data/tournaments.js';

export const nsd = true;
let year = null;
export function render(app) {
  const s = app.state, years = Object.keys(s.champions ?? {}).map(Number).sort();
  if (!years.includes(year)) year = years[years.length - 1] ?? s.date.year;
  const list = [...(s.champions?.[year] ?? [])].filter(c => !NSD_BLOCKED.has(c.cat)).reverse();   // nur Tour-Turniere
  return frame({
    cls: 'fixed', bg: 'grey',
    body: `${header(s.player.name)}<div class="nsd-pager nsd-title-pager"><button data-y="-1">◀</button><b>Titelträger ${year}</b><button data-y="1">▶</button></div>
      <div class="nsd-scroll"><table class="nsd-table">
        <tr><th>KW</th><th style="text-align:left">Turnier</th><th class="alt" style="text-align:left">Sieger</th></tr>
        ${list.map(c => `<tr class="${c.id === 'P' ? 'me' : ''}"><td class="c">${c.week}</td><td class="nm">${esc(c.name)}</td>
          <td class="nm">${flag(c.id === 'P' ? s.player.nation : c.nation)} ${esc(c.id === 'P' ? s.player.name : c.who)}</td></tr>`).join('')
          || '<tr><td colspan="3" class="c">Noch keine Turniere entschieden.</td></tr>'}
      </table></div>`,
    bottom: bar([{ go: 'hub', icon: '🏠', label: 'Start' }, { go: 'calendar', icon: '🗓️', label: 'Spielplan' }, { go: 'league', icon: '🏆', label: 'Ranglisten', wide: true }]),
  });
}
export function mount(root, app) {
  bindHead(root, app, '<p>Alle Turniersieger seit deinem Karrierestart (ohne Qualifier und Premier-League-Spieltage).</p>');
  const years = Object.keys(app.state.champions ?? {}).map(Number).sort();
  root.querySelectorAll('[data-y]').forEach(b => b.onclick = () => {
    const i = years.indexOf(year) + +b.dataset.y;
    if (years[i]) { year = years[i]; app.refresh(); }
  });
}
