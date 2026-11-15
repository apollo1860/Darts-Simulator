// Ranglisten: Ranglisten im NSS-Tabellenlook (PDC-, Pro-Tour-, Players-Championship-, European-Tour-, Challenge-Tour-Rangliste in ★, Premier-League-Tabelle), eigene Zeile grün, Zone blau
import { orderOfMerit } from '../../../rankings.js';
import { esc } from '../../../util.js';
import { flag } from '../../../../data/nations.js';
import { frame, bar, arrowIcon } from '../frame.js';
import { starShow, PL_LEAGUE_PAY } from '../../../nsd.js';
import { plTable } from '../../../majors.js';
import { getPlayer } from '../../../world.js';

export const nsd = true;
// Zone = Qualifikationsplätze: PC Finals Top 64 der PC-OOM, European Championship Top 32 der ET-OOM, Challenge Tour: Top 2 bekommen eine Tourcard
const LISTS = [['pdc', 'PDC Order of Merit', 64], ['protour', 'Pro Tour Order of Merit', 0], ['pco', 'Players Championship OOM', 64], ['eto', 'European Tour OOM', 32], ['challenge', 'Challenge Tour OOM', 2], ['pl', 'Premier League', 4]];
let idx = 0;
// Ranglisten in Basis-★ (1 ★ = 1.000 £, wie die echten Preisgelder) – nicht mit deinem Status-Faktor multipliziert (sonst wären 2 Mio £ bei Status 11 plötzlich 3 Mio)
const money = (v, dec = 0) => (Math.round(v * 10 ** dec) / 10 ** dec).toLocaleString('de-DE', { minimumFractionDigits: dec, maximumFractionDigits: dec });
const fmtStars = v => v.toLocaleString('de-DE');

// Premier League: Platz 5–8 fest (PL_LEAGUE_PAY), Platz 1–4 spielen die Play-offs um 350/170/110
const plPrize = (rank, lvl) => (PL_LEAGUE_PAY[rank] ? fmtStars(starShow(PL_LEAGUE_PAY[rank], lvl)) : 'Play-offs');

// Top 128 – eigene Zeile immer dabei (auch wenn weiter hinten)
const ownRow = all => { const top = all.slice(0, 128), me = all.find(x => x.p.id === 'P'); return me && !top.includes(me) ? [...top, me] : top; };

export function render(app) {
  const [type, label, zone] = LISTS[idx], s = app.state, pl = type === 'pl', ct = type === 'challenge';
  // Challenge Tour (läuft im Hintergrund, Version 84): nur Spieler mit Preisgeld, 1 Nachkommastelle (Beträge sind klein)
  const list = pl ? plTable(s).map((x, i) => ({ rank: i + 1, p: getPlayer(s, x.id), money: x.pts })) : ct ? orderOfMerit(s, type).filter(x => x.money > 0).slice(0, 128) : ownRow(orderOfMerit(s, type));
  return frame({
    cls: 'fixed', bg: 'grey',
    body: `<div class="nsd-title" style="justify-content:space-between;gap:10px">
        <span style="flex:1">${label}</span>
        <span style="display:flex;flex-direction:column;gap:6px"><button class="nsd-sq green" data-l="-1">▲</button><button class="nsd-sq green" data-l="1">▼</button></span>
      </div>
      <div class="nsd-scroll" id="lg-scroll"><table class="nsd-table">
        <tr><th>Pos</th><th style="text-align:left">Name</th><th class="alt num">${pl ? 'Punkte' : 'Preisgeld ★'}</th>${pl ? '<th class="alt num">Preis ★</th>' : ''}</tr>
        ${list.map(x => `<tr class="${x.p.id === 'P' ? 'me' : x.rank <= zone ? 'zone' : ''}" ${x.p.id === 'P' ? 'id="lg-me"' : ''}>
          <td class="c">${x.rank}</td><td class="nm">${flag(x.p.nation)} ${esc(x.p.name)}</td><td class="num">${pl ? x.money : money(x.money, ct ? 1 : 0)}</td>${pl ? `<td class="num">${plPrize(x.rank, s.player.star.level)}</td>` : ''}</tr>`).join('')}
      </table>${ct && !list.length ? '<div class="nsd-ev-sub" style="padding:14px"><b>Noch keine Challenge-Tour-Turniere in dieser Saison</b> – das erste Wochenende ist in KW 11.</div>' : ''}${ct ? '<div class="nsd-ev-sub" style="padding:8px 14px">Die Challenge Tour läuft im Hintergrund (5 Wochenenden × 5 Turniere). Die besten zwei Spieler ohne Tourcard bekommen am Saisonende eine Tourcard.</div>' : ''}</div>`,
    bottom: bar([
      { go: 'hub', icon: '🏠', label: 'Start' },
      { go: 'calendar', icon: '🗓️', label: 'Spielplan' },
      { go: 'tour', icon: '🎫', label: 'Titel' },
      { go: 'week', icon: arrowIcon(), label: 'Weiter' },
    ]),
  });
}
export function mount(root, app) {
  root.querySelectorAll('[data-l]').forEach(b => b.onclick = () => { idx = (idx + LISTS.length + +b.dataset.l) % LISTS.length; app.refresh(); });
  root.querySelector('#lg-me')?.scrollIntoView({ block: 'center' });
}
