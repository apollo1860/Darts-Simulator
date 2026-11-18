// Ranglisten: Ranglisten im NSS-Tabellenlook (PDC-, Pro-Tour-, Players-Championship-, European-Tour-, Challenge-/Development-Tour-Rangliste in ★, Premier-League-Tabelle), eigene Zeile grün, Zone blau
import { orderOfMerit, moneyOf } from '../../../rankings.js';
import { esc } from '../../../util.js';
import { flag } from '../../../../data/nations.js';
import { frame, bar, arrowIcon } from '../frame.js';
import { starShow, PL_LEAGUE_PAY } from '../../../nsd.js';
import { plTable } from '../../../majors.js';
import { getPlayer } from '../../../world.js';
import { icon as nicon } from '../icons.js';

export const nsd = true;
// Zone = Qualifikationsplätze: PC Finals Top 64 der PC-OOM, European Championship Top 32 der ET-OOM, Challenge Tour: Top 2 bekommen eine Tourcard
const LISTS = [['pdc', 'PDC Order of Merit', 64], ['protour', 'Pro Tour Order of Merit', 0], ['pco', 'Players Championship OOM', 64], ['eto', 'European Tour OOM', 32], ['challenge', 'Challenge Tour OOM', 2], ['dev', 'Development Tour OOM', 2], ['wos', "Women's Series OOM", 8], ['pl', 'Premier League', 4]];
let idx = 0;
// Ranglisten in Basis-★ (1 ★ = 1.000 £, wie die echten Preisgelder) – nicht mit deinem Status-Faktor multipliziert (sonst wären 2 Mio £ bei Status 11 plötzlich 3 Mio)
const money = v => fmtStars(Math.round(v));
const money1 = v => (Math.round(v * 10) / 10).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 });   // Challenge Tour: kleine Beträge mit 1 Nachkommastelle
const fmtStars = v => v.toLocaleString('de-DE');

// Premier League: Platz 5–8 fest (PL_LEAGUE_PAY), Platz 1–4 spielen die Play-offs um 350/170/110
const plPrize = (rank, lvl) => (PL_LEAGUE_PAY[rank] ? fmtStars(starShow(PL_LEAGUE_PAY[rank], lvl)) : 'Play-offs');

// Version 197 (Nutzerwunsch): PDC Order of Merit – alle Tourcard-Holder (auch mit 0 Preisgeld, grüner Punkt) mit ihrem offiziellen Platz,
// dazu Spieler ohne Karte mit Preisgeld (ohne Platz „–“, sie zählen für Karten/Qualifikationen nicht mit), nach Preisgeld einsortiert
const pdcList = s => {
  const off = orderOfMerit(s, 'pdc').map(x => ({ ...x, tc: true })), ids = new Set(off.map(x => x.p.id));
  const extra = [...Object.values(s.world.players).filter(p => p.tier !== 'tour' && !ids.has(p.id)), ...(s.player.tour !== 'tour' ? [s.player] : [])]
    .map(p => ({ p, money: moneyOf(s, 'pdc', p.id), rank: null })).filter(x => x.money > 0);
  return [...off, ...extra].sort((a, b) => b.money - a.money || (a.rank ?? 1e9) - (b.rank ?? 1e9));
};
// Top 128 – eigene Zeile immer dabei (auch wenn weiter hinten)
const ownRow = all => { const top = all.slice(0, 128), me = all.find(x => x.p.id === 'P'); return me && !top.includes(me) ? [...top, me] : top; };

export function render(app) {
  const [type, label, zone] = LISTS[idx], s = app.state, pl = type === 'pl', ct = type === 'challenge' || type === 'dev', wos = type === 'wos';
  // Challenge/Development Tour (laufen im Hintergrund, Version 84/86): nur Spieler mit Preisgeld, 1 Nachkommastelle (Beträge sind klein)
  const list = pl ? plTable(s).map((x, i) => ({ rank: i + 1, p: getPlayer(s, x.id), money: x.pts })) : ct || wos ? orderOfMerit(s, type).filter(x => x.money > 0).slice(0, 128) : type === 'pdc' ? pdcList(s) : ownRow(orderOfMerit(s, type));
  // Tourcard am Saisonende: die besten zwei Spieler OHNE Karte (Dev Tour: Holder bis 23 spielen mit, bekommen aber keine zweite Karte)
  const cardIds = ct ? new Set(list.filter(x => x.p.id === 'P' ? s.player.tour !== 'tour' : x.p.tier !== 'tour').slice(0, zone).map(x => x.p.id)) : null;
  const first = type === 'dev' ? 14 : 11;
  return frame({
    cls: 'fixed', bg: 'grey',
    body: `<div class="nsd-title" style="justify-content:space-between;gap:10px">
        <span style="flex:1">${label}</span>
        <span style="display:flex;flex-direction:column;gap:6px"><button class="nsd-sq green" data-l="-1">▲</button><button class="nsd-sq green" data-l="1">▼</button></span>
      </div>
      <div class="nsd-scroll" id="lg-scroll"><table class="nsd-table">
        <tr><th>Pos</th><th style="text-align:left">Name</th><th class="alt num">${pl ? 'Punkte' : 'Preisgeld ★'}</th>${pl ? '<th class="alt num">Preis ★</th>' : ''}</tr>
        ${list.map(x => `<tr class="${x.p.id === 'P' ? 'me' : (cardIds ? cardIds.has(x.p.id) : x.rank != null && x.rank <= zone) ? 'zone' : ''}" ${x.p.id === 'P' ? 'id="lg-me"' : ''}>
          <td class="c">${x.rank ?? '–'}</td><td class="nm">${flag(x.p.nation)}${x.tc ? '<i class="nsd-tc" title="Tourcard"></i>' : ''} ${esc(x.p.name)}</td><td class="num">${pl ? x.money : ct || wos ? money1(x.money) : money(x.money)}</td>${pl ? `<td class="num">${plPrize(x.rank, s.player.star.level)}</td>` : ''}</tr>`).join('')}
      </table>${wos ? `<div class="nsd-ev-sub" style="padding:8px 14px">${list.length ? '' : '<b>Noch keine Turniere in dieser Saison</b> – das erste Wochenende ist in KW 6. '}Die Women's Series läuft im Hintergrund (6 Wochenenden × 4 Turniere). Die Top 8 spielen das Women's World Matchplay (KW 29); die Rangliste vergibt auch Plätze für Grand Slam und WM.</div>` : ''}${ct && !list.length ? `<div class="nsd-ev-sub" style="padding:14px"><b>Noch keine ${type === 'dev' ? 'Development-Tour' : 'Challenge-Tour'}-Turniere in dieser Saison</b> – das erste Wochenende ist in KW ${first}.</div>` : ''}${ct ? `<div class="nsd-ev-sub" style="padding:8px 14px">${type === 'dev' ? 'Die Development Tour (bis 23 Jahre; auch Tourcard-Holder außerhalb der PDC-Top-64)' : 'Die Challenge Tour'} läuft im Hintergrund (5 Wochenenden × 5 Turniere). Die besten zwei Spieler ohne Tourcard bekommen am Saisonende eine Tourcard.</div>` : ''}</div>`,
    bottom: bar([
      { go: 'hub', icon: nicon('home'), label: 'Start' },
      { go: 'calendar', icon: nicon('calendar'), label: 'Spielplan' },
      { go: 'tour', icon: '🎫', label: 'Titel' },
      { go: 'week', icon: arrowIcon(), label: 'Weiter' },
    ]),
  });
}
export function mount(root, app) {
  root.querySelectorAll('[data-l]').forEach(b => b.onclick = () => { idx = (idx + LISTS.length + +b.dataset.l) % LISTS.length; app.refresh(); });
  root.querySelector('#lg-me')?.scrollIntoView({ block: 'center' });
}
