// Ranglisten: Ranglisten im NSS-Tabellenlook (PDC-, Pro-Tour-Rangliste in ★, Premier-League-Tabelle), eigene Zeile grün, Zone blau
import { orderOfMerit } from '../../../rankings.js';
import { esc } from '../../../util.js';
import { flag } from '../../../../data/nations.js';
import { frame, bar } from '../frame.js';
import { starShow } from '../../../nsd.js';
import { plTable } from '../../../majors.js';
import { getPlayer } from '../../../world.js';

export const nsd = true;
const LISTS = [['pdc', 'PDC Order of Merit', 64], ['protour', 'Pro Tour Order of Merit', 0], ['pl', 'Premier League', 4]];
let idx = 0;
// Ranglisten in ★: Basiswerte × dein Status-Faktor (als hätten alle deinen Status)
const money = (v, lvl) => fmtStars(starShow(v, lvl));
const fmtStars = v => v.toLocaleString('de-DE');

// Top 128 – eigene Zeile immer dabei (auch wenn weiter hinten)
const ownRow = all => { const top = all.slice(0, 128), me = all.find(x => x.p.id === 'P'); return me && !top.includes(me) ? [...top, me] : top; };

export function render(app) {
  const [type, label, zone] = LISTS[idx], s = app.state, pl = type === 'pl';
  const list = pl ? plTable(s).map((x, i) => ({ rank: i + 1, p: getPlayer(s, x.id), money: x.pts })) : ownRow(orderOfMerit(s, type));
  return frame({
    cls: 'fixed', bg: 'grey',
    body: `<div class="nsd-title" style="justify-content:space-between;gap:10px">
        <span style="flex:1">${label}</span>
        <span style="display:flex;flex-direction:column;gap:6px"><button class="nsd-sq green" data-l="-1">▲</button><button class="nsd-sq green" data-l="1">▼</button></span>
      </div>
      <div class="nsd-scroll" id="lg-scroll"><table class="nsd-table">
        <tr><th>Pos</th><th style="text-align:left">Name</th><th class="alt num">${pl ? 'Punkte' : 'Preisgeld ★'}</th></tr>
        ${list.map(x => `<tr class="${x.p.id === 'P' ? 'me' : x.rank <= zone ? 'zone' : ''}" ${x.p.id === 'P' ? 'id="lg-me"' : ''}>
          <td class="c">${x.rank}</td><td class="nm">${flag(x.p.nation)} ${esc(x.p.name)}</td><td class="num">${pl ? x.money : money(x.money, s.player.star.level)}</td></tr>`).join('')}
      </table></div>`,
    bottom: bar([
      { go: 'hub', icon: '🏠', label: 'Start' },
      { go: 'calendar', icon: '🗓️', label: 'Spielplan' },
      { go: 'tour', icon: '🎫', label: 'Titel' },
      { go: 'week', icon: '<span style="color:#2bd33a">➡</span>', label: 'Weiter' },
    ]),
  });
}
export function mount(root, app) {
  root.querySelectorAll('[data-l]').forEach(b => b.onclick = () => { idx = (idx + LISTS.length + +b.dataset.l) % LISTS.length; app.refresh(); });
  root.querySelector('#lg-me')?.scrollIntoView({ block: 'center' });
}
