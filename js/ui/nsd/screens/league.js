// Liga: Ranglisten im NSS-Tabellenlook (PDC- und Pro-Tour-Rangliste), eigene Zeile grün, Tourcard-Zone blau
import { orderOfMerit } from '../../../rankings.js';
import { esc } from '../../../util.js';
import { flag } from '../../../../data/nations.js';
import { frame, bar } from '../frame.js';
import { starShow } from '../../../nsd.js';

export const nsd = true;
const LISTS = [['pdc', 'PDC Order of Merit', 64], ['protour', 'Pro Tour Order of Merit', 0]];
let idx = 0;
// Ranglisten in ★: Basiswerte × dein Status-Faktor (als hätten alle deinen Status)
const money = (v, lvl) => fmtStars(starShow(v, lvl));
const fmtStars = v => v.toLocaleString('de-DE');

export function render(app) {
  const [type, label, zone] = LISTS[idx], list = orderOfMerit(app.state, type).slice(0, 128);
  return frame({
    cls: 'fixed', bg: 'grey',
    body: `<div class="nsd-title" style="justify-content:space-between;gap:10px">
        <span style="flex:1">${label}</span>
        <span style="display:flex;flex-direction:column;gap:6px"><button class="nsd-sq green" data-l="-1">▲</button><button class="nsd-sq green" data-l="1">▼</button></span>
      </div>
      <div class="nsd-scroll" id="lg-scroll"><table class="nsd-table">
        <tr><th>Pos</th><th style="text-align:left">Name</th><th class="alt num">Preisgeld ★</th></tr>
        ${list.map(x => `<tr class="${x.p.id === 'P' ? 'me' : x.rank <= zone ? 'zone' : ''}" ${x.p.id === 'P' ? 'id="lg-me"' : ''}>
          <td class="c">${x.rank}</td><td class="nm">${flag(x.p.nation)} ${esc(x.p.name)}</td><td class="num">${money(x.money, app.state.player.star.level)}</td></tr>`).join('')}
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
