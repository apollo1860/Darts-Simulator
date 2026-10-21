// Sponsoren: laufende Verträge, offenes Angebot mit Verhandlung (Höher/Niedriger), Annehmen/Ablehnen
import { SPONSOR_SLOTS } from '../../../../data/sponsors.js';
import { negotiate, acceptOffer, declineOffer, offerTerms, managerOf, NEGO_MAX } from '../../../career.js';
import { RNG } from '../../../rng.js';
import { esc } from '../../../util.js';
import { frame, header, titleBand, darkBar, coin, bar, bindHead, checkIcon } from '../frame.js';
import { toast } from '../../components.js';

export const nsd = true;
// Darts-Flight mit Zahl (1–10)
const flight = (n, cls = '') => `<div class="nsd-flight ${cls}"><svg viewBox="0 0 100 120"><defs><linearGradient id="fg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3fd0ff"/><stop offset="1" stop-color="#1550c8"/></linearGradient></defs>
  <path d="M50 4 L94 46 L70 116 L50 96 L30 116 L6 46 Z" fill="url(#fg)" stroke="#0b1e4a" stroke-width="4" stroke-linejoin="round"/><path d="M50 4 V96" stroke="#0b1e4a" stroke-width="3" opacity=".5"/></svg><b>${n}</b></div>`;
const terms = t => `${t.perWeek} ★/Woche · ${t.win} ★ je Sieg${t.s180 ? ` · ${t.s180} ★ je 180` : ''}${t.major ? ` · ${t.major} ★ je Major` : ''}`;
const HELP = '<p>Sponsoren zahlen jede Woche ★, dazu Prämien (Sieg, manchmal 180er oder Major-Teilnahme). Angebote kommen über deinen Manager (ohne Manager selten) – je höher Star-Status, Fans und Rang, desto mehr.</p><p><b>Verhandeln</b>: Auf dem Flight steht eine Zahl von 1 bis 10. Tippe, ob die nächste höher oder niedriger ist – max. 5×. Jeder Treffer erhöht alle Prämien leicht, jeder Versuch kostet aber etwas Sponsor-Zufriedenheit. Liegst du falsch, ist die Verhandlung vorbei: Es gilt nur noch das Anfangsangebot und der Sponsor startet genervt.</p>';

export function render(app, params = {}) {
  const s = app.state, p = s.player, sp = s.nsdSponsors ?? { active: [], offer: null }, o = sp.offer, last = params.last;
  const offer = o ? `<div class="nsd-offer">
      <div class="nsd-ev-name">${SPONSOR_SLOTS[o.slot].icon} ${esc(o.name)}</div>
      <div class="nsd-ev-sub">${SPONSOR_SLOTS[o.slot].label} · ${o.length} Wochen · noch ${o.weeks} Woche${o.weeks > 1 ? 'n' : ''} gültig</div>
      <div class="nsd-offer-val">${coin(offerTerms(o).perWeek)} <small>pro Woche</small> ${o.bonus ? `<b class="pos">+${Math.round(o.bonus * 100)} %</b>` : ''}</div>
      <div class="nsd-ev-sub">${terms(offerTerms(o))}</div>
      <div class="nsd-hl">${flight(Math.min(10, o.card), last ? (last.ok ? 'ok' : 'bad') : '')}
        ${o.done ? `<div class="nsd-ev-sub">${o.annoyed ? '😠 Verzockt – nur noch das Anfangsangebot, der Sponsor ist genervt.' : 'Mehr ist nicht drin.'}</div>`
          : `<div class="nsd-hl-btns"><button class="nsd-btn" data-g="higher"><span class="lb">▲ Höher</span></button><button class="nsd-btn" data-g="lower"><span class="lb">▼ Niedriger</span></button>
             <div class="nsd-ev-sub">Versuch ${(o.steps ?? 0) + 1} von ${NEGO_MAX}</div></div>`}</div>
    </div>` : `<div class="nsd-card" style="font-size:1.2rem">Kein offenes Angebot.${managerOf(s) ? '' : ' Ohne Manager bekommst du keine Sponsor-Angebote.'}</div>`;
  return frame({
    body: `${header(p.name)}${titleBand('Sponsoren')}
      ${darkBar(`Laufende Verträge (${sp.active.length}/4)`, 'sm')}
      <div class="nsd-evs">${sp.active.map(c => `<div class="nsd-ev"><div class="nsd-ev-main"><div class="nsd-ev-name">${SPONSOR_SLOTS[c.slot].icon} ${esc(c.name)}</div>
        <div class="nsd-ev-sub">${terms({ perWeek: c.perWeek, win: c.win ?? 0, s180: c.s180, major: c.major })} · noch ${c.weeksLeft} Wochen</div></div></div>`).join('') || '<div class="nsd-ev-sub" style="padding:4px 6px">Noch keine Sponsoren.</div>'}</div>
      ${darkBar('Angebot', 'sm')}${offer}`,
    bottom: bar(o ? [{ id: 'o-no', icon: '✖', label: 'Ablehnen' }, { go: 'team', icon: '💼', label: 'Team' }, { id: 'o-yes', icon: checkIcon(), label: 'Unterschreiben', wide: true }]
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
