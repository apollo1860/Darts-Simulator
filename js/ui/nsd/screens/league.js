// Ranglisten: Ranglisten im NSS-Tabellenlook (PDC-, Pro-Tour-, Players-Championship-, European-Tour-, Challenge-/Development-Tour-Rangliste in ★, Premier-League-Tabelle), eigene Zeile grün, Zone blau
import { orderOfMerit } from '../../../rankings.js';
import { esc } from '../../../util.js';
import { flag, nationName } from '../../../../data/nations.js';
import { placementsOf } from '../../../history.js';
import { placeLabel } from '../../../tournaments.js';
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

// Version 197/199: PDC Order of Merit – alle Tourcard-Holder (auch mit 0 Preisgeld) und Spieler ohne Karte mit Preisgeld, alle mit Platz
// (wie die echte PDC); Holder mit grünem Punkt in eigener Spalte
const pdcList = s => orderOfMerit(s, 'pdc').map(x => ({ ...x, tc: x.p.id === 'P' ? s.player.tour === 'tour' : x.p.tier === 'tour' }));
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
        <tr><th>Pos</th><th style="text-align:left">Name</th>${type === 'pdc' ? '<th class="alt nsd-tc-col"></th>' : ''}<th class="alt num">${pl ? 'Punkte' : 'Preisgeld ★'}</th>${pl ? '<th class="alt num">Preis ★</th>' : ''}</tr>
        ${list.map(x => `<tr class="${x.p.id === 'P' ? 'me' : (cardIds ? cardIds.has(x.p.id) : x.rank != null && x.rank <= zone) ? 'zone' : ''}" ${x.p.id === 'P' ? 'id="lg-me"' : ''} ${pl ? '' : `data-pid="${esc(x.p.id)}"`}>
          <td class="c">${x.rank ?? '–'}</td><td class="nm">${flag(x.p.nation)} ${esc(x.p.name)}</td>${type === 'pdc' ? `<td class="nsd-tc-col">${x.tc ? '<i class="nsd-tc" title="Tourcard"></i>' : ''}</td>` : ''}<td class="num">${pl ? x.money : ct || wos ? money1(x.money) : money(x.money)}</td>${pl ? `<td class="num">${plPrize(x.rank, s.player.star.level)}</td>` : ''}</tr>`).join('')}
      </table>${wos ? `<div class="nsd-ev-sub" style="padding:8px 14px">${list.length ? '' : '<b>Noch keine Turniere in dieser Saison</b> – das erste Wochenende ist in KW 6. '}Die Women's Series läuft im Hintergrund (6 Wochenenden × 4 Turniere). Die Top 8 spielen das Women's World Matchplay (KW 29); die Rangliste vergibt auch Plätze für Grand Slam und WM.</div>` : ''}${ct && !list.length ? `<div class="nsd-ev-sub" style="padding:14px"><b>Noch keine ${type === 'dev' ? 'Development-Tour' : 'Challenge-Tour'}-Turniere in dieser Saison</b> – das erste Wochenende ist in KW ${first}.</div>` : ''}${ct ? `<div class="nsd-ev-sub" style="padding:8px 14px">${type === 'dev' ? 'Die Development Tour (bis 23 Jahre; auch Tourcard-Holder außerhalb der PDC-Top-64)' : 'Die Challenge Tour'} läuft im Hintergrund (5 Wochenenden × 5 Turniere). Die besten zwei Spieler ohne Tourcard bekommen am Saisonende eine Tourcard.</div>` : ''}</div>`,
    bottom: bar([
      { go: 'hub', icon: nicon('home'), label: 'Start' },
      { go: 'calendar', icon: nicon('calendar'), label: 'Spielplan' },
      { go: 'tour', icon: '🎫', label: 'Titel' },
      { go: 'week', icon: arrowIcon(), label: 'Weiter' },
    ]),
  });
}
// Version 221: Spieler-Pop-up – Name + Nation, Alter, Tourcard in Folge, alle Platzierungen des laufenden Jahres (neueste zuerst)
function tourText(s, p, tour) {
  if (!tour) return 'Keine Tourcard';
  const y = s.date.year, y0 = s.startYear ?? 2026, n = k => `${k} ${k === 1 ? 'Jahr' : 'Jahre'}`;
  if (!p.tourSince) return `Tourcard seit vor ${y0} – mind. ${n(y - y0 + 1)} in Folge`;
  return `Tourcard seit ${p.tourSince} – ${y - p.tourSince + 1}. Jahr in Folge`;
}
function playerPopup(app, id) {
  const s = app.state, p = id === 'P' ? s.player : getPlayer(s, id);
  if (!p) return;
  const tour = id === 'P' ? s.player.tour === 'tour' : p.tier === 'tour', list = placementsOf(s, id);
  const bd = document.createElement('div');
  bd.className = 'nsd-pop-bd';
  bd.innerHTML = `<div class="nsd-pop" role="dialog" aria-modal="true">
    <button class="nsd-sq red nsd-pop-x" aria-label="Schließen">✖</button>
    <div class="nsd-pop-name">${flag(p.nation)} ${esc(p.name)}</div>
    <div class="nsd-pop-info">${esc(nationName(p.nation))} · ${p.age} Jahre</div>
    <div class="nsd-pop-info">${esc(tourText(s, p, tour))}</div>
    <div class="nsd-pop-list">${list.length ? `<table class="nsd-table nsd-pop-t"><tr><th>KW</th><th style="text-align:left">Turnier ${s.date.year}</th><th>Platz</th></tr>
      ${list.map(r => `<tr class="${r.place === 'W' ? 'win' : ''}"><td class="c">${r.week}</td><td class="tn">${esc(r.name)}</td><td class="c pl">${esc(placeLabel(r.place, r.cat, r.eventId))}</td></tr>`).join('')}</table>`
      : `<div class="nsd-pop-empty">Noch keine Turniere in ${s.date.year}.</div>`}</div>
  </div>`;
  const close = () => bd.remove();
  bd.addEventListener('click', e => { if (e.target === bd || e.target.closest('.nsd-pop-x')) close(); });
  document.body.appendChild(bd);
}
export function mount(root, app) {
  root.querySelectorAll('[data-pid]').forEach(tr => tr.onclick = () => playerPopup(app, tr.dataset.pid));
  root.querySelectorAll('[data-l]').forEach(b => b.onclick = () => { idx = (idx + LISTS.length + +b.dataset.l) % LISTS.length; app.refresh(); });
  root.querySelector('#lg-me')?.scrollIntoView({ block: 'center' });
}
