// Ranglisten (Order of Merits) mit Tourcard-Linie
import { esc, fmtEUR } from '../../util.js';
import { flag } from '../../../data/nations.js';
import { OOM_TYPES, orderOfMerit } from '../../rankings.js';
import { getPlayer } from '../../world.js';
import { topbar, playerModal } from '../components.js';
import { plTable } from '../../majors.js';

let tab = 'pdc';

const NOTE = {
  pdc: 'Preisgeld der letzten 2 Jahre (Players Championships, European Tour; Majors ab Phase 5). Am Saisonende wird die Tourcard der Top 64 um 1 Jahr verlängert; wer außerhalb steht, verliert eine auslaufende Karte. Top 16 sind bei der European Tour gesetzt.',
  protour: 'Preisgeld der laufenden Saison aus Players Championships und European Tour.',
  challenge: 'Saisonwertung der Challenge Tour (alle Spieler ohne Tourcard). Platz 1 und 2 erhalten am Jahresende eine Tourcard für 2 Jahre.',
  dev: 'Saisonwertung der Development Tour (bis 23 Jahre). Platz 1 und 2 erhalten am Jahresende eine Tourcard für 2 Jahre.',
};

const tabs = s => [...Object.entries(OOM_TYPES).filter(([, x]) => !x.hidden), ...(s.pl?.[s.date.year] ? [['pl', { short: 'Premier League' }]] : [])]
  .map(([k, x]) => `<button class="chip ${tab === k ? 'active' : ''}" data-t="${k}">${esc(x.short)}</button>`).join('');

// Premier-League-Tabelle (Sieg 5, Finale 3, Halbfinale 2 Punkte je Spieltag)
function renderPL(app) {
  const s = app.state, pl = s.pl[s.date.year], rows = plTable(s);
  return `${topbar({ title: 'Ranglisten', sub: `Premier League ${s.date.year} · ${pl.nights}/16 Spieltage` })}
  <div class="filter-row">${tabs(s)}</div>
  <div class="panel muted" style="margin-bottom:12px;font-size:.84rem">Top 8 der PDC OOM zu Saisonbeginn. Je Spieltag K.-o. (first to 6): Sieger 5, Finalist 3, Halbfinalisten 2 Punkte. Die besten 4 spielen die Play-offs in KW 22.</div>
  <div class="panel table-wrap"><table class="table">
    <tr><th>#</th><th>Spieler</th><th class="r">Legs ±</th><th class="r">Punkte</th></tr>
    ${rows.map((x, i) => { const p = getPlayer(s, x.id); return `<tr class="clickable ${x.id === 'P' ? 'me' : ''} ${i === 3 ? 'cut' : ''}" data-pl="${x.id}"><td class="num">${i + 1}</td>
      <td>${flag(p.nation)} ${esc(p.name)}</td><td class="r num">${x.legs > 0 ? '+' : ''}${x.legs}</td><td class="r num"><b>${x.pts}</b></td></tr>`; }).join('')}
  </table></div>`;
}

export function render(app) {
  const s = app.state, t = OOM_TYPES[tab];
  if (tab === 'pl') return renderPL(app);
  const list = orderOfMerit(s, tab);
  const meIdx = list.findIndex(x => x.p.id === 'P');
  const line = t.cards;
  return `${topbar({ title: 'Ranglisten', sub: `${t.label} · ${s.date.year}` })}
  <div class="filter-row">${tabs(s)}</div>
  <div class="panel muted" style="margin-bottom:12px;font-size:.84rem">${NOTE[tab]}</div>
  ${meIdx >= 0 ? `<div class="panel" style="margin-bottom:12px"><b class="cyan">Dein Platz: ${meIdx + 1}</b> von ${list.length} · ${fmtEUR(list[meIdx].money)}</div>`
    : '<div class="muted" style="font-size:.8rem;margin-bottom:8px">Du bist in dieser Rangliste nicht geführt.</div>'}
  <div class="panel table-wrap"><table class="table">
    <tr><th>#</th><th>Spieler</th><th class="r">OVR</th><th class="r hide-sm">Alter</th><th class="r">Preisgeld</th></tr>
    ${list.map(x => `<tr class="clickable ${x.p.id === 'P' ? 'me' : ''} ${line && x.rank === line ? 'cut' : ''}" data-pl="${x.p.id}"><td class="num">${x.rank}</td>
      <td>${flag(x.p.nation)} ${esc(x.p.name)}</td><td class="r num">${x.ovr}</td><td class="r num hide-sm">${x.p.age}</td><td class="r num">${fmtEUR(x.money)}</td></tr>`).join('')}
  </table></div>`;
}

export function mount(root, app) {
  root.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tab = b.dataset.t; app.refresh(); });
  root.querySelectorAll('[data-pl]').forEach(r => r.onclick = () => playerModal(getPlayer(app.state, r.dataset.pl), r.dataset.pl === 'P'));
}
