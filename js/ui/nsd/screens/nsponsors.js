// Sponsoren: laufende Verträge, offenes Angebot mit Verhandlung (Höher/Niedriger), Annehmen/Ablehnen
import { SPONSOR_SLOTS } from '../../../../data/sponsors.js';
import { negotiate, acceptOffer, declineOffer, offerValue, managerOf } from '../../../career.js';
import { RNG } from '../../../rng.js';
import { esc } from '../../../util.js';
import { frame, header, titleBand, darkBar, coin, bar, bindHead } from '../frame.js';
import { toast } from '../../components.js';

export const nsd = true;
const CARD = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'B', 'D', 'K'];
const HELP = '<p>Sponsoren zahlen jede Woche ★. Angebote kommen über deinen Manager (ohne Manager selten) – je höher Star-Status, Fans und Rang, desto mehr.</p><p><b>Verhandeln</b>: Tippe, ob die nächste Karte höher oder niedriger ist. Jeder Treffer +15 % (max. 5), ein Fehler beendet die Verhandlung mit −10 %. Du kannst jederzeit annehmen.</p>';

export function render(app, params = {}) {
  const s = app.state, p = s.player, sp = s.nsdSponsors ?? { active: [], offer: null }, o = sp.offer, last = params.last;
  const offer = o ? `<div class="nsd-offer">
      <div class="nsd-ev-name">${SPONSOR_SLOTS[o.slot].icon} ${esc(o.name)}</div>
      <div class="nsd-ev-sub">${SPONSOR_SLOTS[o.slot].label} · ${o.length} Wochen · noch ${o.weeks} Woche${o.weeks > 1 ? 'n' : ''} gültig</div>
      <div class="nsd-offer-val">${coin(offerValue(o))} <small>pro Woche</small> ${o.bonus ? `<b class="${o.bonus > 0 ? 'pos' : 'neg'}">${o.bonus > 0 ? '+' : ''}${Math.round(o.bonus * 100)} %</b>` : ''}</div>
      <div class="nsd-hl"><div class="nsd-pcard ${last ? (last.ok ? 'ok' : 'bad') : ''}">${CARD[o.card]}</div>
        ${o.done ? `<div class="nsd-ev-sub">${last && !last.ok ? 'Verzockt – der Sponsor bleibt aber dran.' : 'Mehr ist nicht drin.'}</div>`
          : '<div class="nsd-hl-btns"><button class="nsd-btn" data-g="higher"><span class="lb">▲ Höher</span></button><button class="nsd-btn" data-g="lower"><span class="lb">▼ Niedriger</span></button></div>'}</div>
    </div>` : `<div class="nsd-card" style="font-size:1.2rem">Kein offenes Angebot.${managerOf(s) ? '' : ' Ein Manager besorgt dir mehr Angebote.'}</div>`;
  return frame({
    body: `${header(p.name)}${titleBand('Sponsoren')}
      ${darkBar(`Laufende Verträge (${sp.active.length}/4)`, 'sm')}
      <div class="nsd-evs">${sp.active.map(c => `<div class="nsd-ev"><div class="nsd-ev-main"><div class="nsd-ev-name">${SPONSOR_SLOTS[c.slot].icon} ${esc(c.name)}</div>
        <div class="nsd-ev-sub">${coin(c.perWeek)} pro Woche · noch ${c.weeksLeft} Wochen</div></div></div>`).join('') || '<div class="nsd-ev-sub" style="padding:4px 6px">Noch keine Sponsoren.</div>'}</div>
      ${darkBar('Angebot', 'sm')}${offer}`,
    bottom: bar(o ? [{ id: 'o-no', icon: '✖', label: 'Ablehnen' }, { go: 'team', icon: '💼', label: 'Team' }, { id: 'o-yes', icon: '<span class="nsd-check">✔</span>', label: 'Unterschreiben', wide: true }]
      : [{ go: 'hub', icon: '🏠', label: 'Start' }, { go: 'life', icon: '👥', label: 'Leben' }, { go: 'team', icon: '💼', label: 'Team', wide: true }]),
  });
}
export function mount(root, app) {
  const s = app.state;
  bindHead(root, app, HELP);
  root.querySelectorAll('[data-g]').forEach(b => b.onclick = () => {
    try { const r = negotiate(s, b.dataset.g, new RNG(s.rng)); app.save(); app.go('sponsors', { last: r }); } catch (e) { toast(e.message, 'error'); }
  });
  root.querySelector('#o-yes')?.addEventListener('click', () => { acceptOffer(s); app.save(); toast('Vertrag unterschrieben!'); app.go('sponsors'); });
  root.querySelector('#o-no')?.addEventListener('click', () => { declineOffer(s); app.save(); app.go('sponsors'); });
}
