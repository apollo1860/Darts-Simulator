// Ranglisten (Order of Merits)
import { esc, fmtEUR } from '../../util.js';
import { flag } from '../../../data/nations.js';
import { OOM_TYPES, orderOfMerit } from '../../rankings.js';
import { getPlayer } from '../../world.js';
import { topbar, playerModal } from '../components.js';

let tab = 'pdc';

export function render(app) {
  const s = app.state;
  const list = orderOfMerit(s, tab);
  const empty = list.every(x => !x.money);
  return `${topbar({ title: 'Ranglisten', sub: OOM_TYPES[tab].label })}
  <div class="filter-row">${Object.entries(OOM_TYPES).map(([k, t]) => `<button class="chip ${tab === k ? 'active' : ''}" data-t="${k}">${esc(t.label)}</button>`).join('')}</div>
  ${empty ? '<div class="panel muted" style="margin-bottom:12px;font-size:.86rem">Noch keine Ranglisten-Turniere gespielt (ab Phase 3/4). Vorläufig sortiert nach Spielstärke.</div>' : ''}
  ${s.player.tour === OOM_TYPES[tab].tour ? '' : '<div class="muted" style="font-size:.8rem;margin-bottom:8px">Du bist in dieser Rangliste nicht geführt.</div>'}
  <div class="panel table-wrap"><table class="table">
    <tr><th>#</th><th>Spieler</th><th class="r">OVR</th><th class="r">Alter</th><th class="r">Preisgeld</th></tr>
    ${list.map(x => `<tr class="clickable ${x.p.id === 'P' ? 'me' : ''}" data-pl="${x.p.id}"><td class="num">${x.rank}</td>
      <td>${flag(x.p.nation)} ${esc(x.p.name)}</td><td class="r num">${x.ovr}</td><td class="r num">${x.p.age}</td><td class="r num">${fmtEUR(x.money)}</td></tr>`).join('')}
  </table></div>`;
}

export function mount(root, app) {
  root.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tab = b.dataset.t; app.refresh(); });
  root.querySelectorAll('[data-pl]').forEach(r => r.onclick = () => playerModal(getPlayer(app.state, r.dataset.pl), r.dataset.pl === 'P'));
}
