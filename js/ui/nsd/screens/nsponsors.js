// Sponsoren: laufende Verträge, offenes Angebot mit Verhandlung (Höher/Niedriger), Annehmen/Ablehnen
import { negotiate, acceptOffer, declineOffer, cancelSponsor, offerConflict, brancheOf, offerTerms, managerOf, normalContracts, sponsorBlockWeeks, acceptControversial, declineControversial, NEGO_MAX, SPONSOR_MAX } from '../../../career.js';
import { CONTROVERSY_SIGN_FANS } from '../../../../data/controversial.js';
import { RNG } from '../../../rng.js';
import { esc } from '../../../util.js';
import { frame, header, titleBand, darkBar, coin, bar, bindHead, checkIcon } from '../frame.js';
import { toast, modal, confirmDialog } from '../../components.js';
import { icon as nicon } from '../icons.js';

export const nsd = true;
// Darts-Flight mit Zahl (1–10)
const flight = (n, cls = '') => `<div class="nsd-flight ${cls}"><svg viewBox="0 0 100 120"><defs><linearGradient id="fg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3fd0ff"/><stop offset="1" stop-color="#1550c8"/></linearGradient></defs>
  <path d="M50 4 L94 46 L70 116 L50 96 L30 116 L6 46 Z" fill="url(#fg)" stroke="#0b1e4a" stroke-width="4" stroke-linejoin="round"/><path d="M50 4 V96" stroke="#0b1e4a" stroke-width="3" opacity=".5"/></svg><b>${n}</b></div>`;
const fameDots = n => (n ? `${'●'.repeat(n)}${'○'.repeat(5 - n)}` : '');
const brand = c => (c.controversial ? ` · ${c.tag}` : c.real ? ` · Bekannte Marke ${fameDots(c.fame)}` : ' · kleine regionale Marke');
const terms = t => `${t.perWeek} ★/Woche · ${t.win} ★ je Sieg${t.s180 ? ` · ${t.s180} ★ je 180` : ''}${t.major ? ` · ${t.major} ★ je Major` : ''}`;
const HELP = '<p><b>⚠️ Umstrittene Firmen</b> (ab Status 25, etwa alle 1–2 Jahre) zahlen sehr gut, sorgen aber für Ärger: Fans verlieren die Lust, und andere Sponsoren können abspringen. Sie sind von der Branchenregel ausgenommen und zählen nicht zu deinen 5 Plätzen – du musst niemanden für sie kündigen. Es läuft immer nur ein solcher Vertrag. Die Folgen können heftig sein (Skandale, mehrere Sponsoren springen ab, Sponsoren-Sperre, Krisen-PR, Manager-Krach): Etwa jeder zweite Deal lohnt sich am Ende nicht.</p><p><b>Branchen</b>: Jede Marke gehört zu einer festen Branche – pro Branche kannst du nur einen Sponsor haben (z. B. nur eine Automarke, nur einen Supermarkt) und insgesamt höchstens 5 gleichzeitig. Für einen neuen Vertrag musst du sonst einen laufenden kündigen (kostenlos, jederzeit).</p><p>Bis Star-Status 10 bieten dir nur kleine regionale Firmen einen Vertrag an – die zahlen wenig. Ab Status 11 kommen bekannte Marken dazu, ab 20 und ab 40 immer größere: Je bekannter die Marke, desto besser zahlt sie.</p><p>Sponsoren zahlen jede Woche ★, dazu Prämien (Sieg, manchmal 180er oder Major-Teilnahme). Angebote kommen über deinen Manager (ohne Manager selten) – je höher Star-Status, Fans und Rang, desto mehr.</p><p><b>Verhandeln</b>: Auf dem Flight steht eine Zahl von 1 bis 10. Tippe, ob die nächste höher oder niedriger ist – max. 5×. Jeder Treffer erhöht alle Prämien leicht, jeder Versuch kostet aber etwas Sponsor-Zufriedenheit. Liegst du falsch, ist die Verhandlung vorbei: Es gilt nur noch das Anfangsangebot und der Sponsor startet genervt.</p>';

// Hinweis, was beim Unterschreiben passiert
const conflictNote = (s, o) => {
  const cf = offerConflict(s, o);
  if (!cf) return '';
  return cf.kind === 'branche' ? `<div class="nsd-ev-sub neg">⚠ Ersetzt deinen laufenden Vertrag in dieser Branche: ${esc(cf.drop)}</div>`
    : `<div class="nsd-ev-sub neg">⚠ Du hast schon ${SPONSOR_MAX} Sponsoren – für diesen Vertrag musst du einen kündigen.</div>`;
};

export function render(app, params = {}) {
  const s = app.state, p = s.player, sp = s.nsdSponsors ?? { active: [], offer: null }, o = sp.offer, last = params.last;
  const offer = o ? `<div class="nsd-offer">
      <div class="nsd-ev-name">${brancheOf(o).icon} ${esc(o.name)}</div>
      <div class="nsd-ev-sub">${brancheOf(o).label}${brand(o)} · ${o.length} Wochen · noch ${o.weeks} Woche${o.weeks > 1 ? 'n' : ''} gültig</div>
      <div class="nsd-offer-val">${coin(offerTerms(o).perWeek)} <small>pro Woche</small> ${o.bonus ? `<b class="pos">+${Math.round(o.bonus * 100)} %</b>` : ''}</div>
      <div class="nsd-ev-sub">${terms(offerTerms(o))}</div>
      ${conflictNote(s, o)}
      <div class="nsd-hl">${flight(Math.min(10, o.card), last ? (last.ok ? 'ok' : 'bad') : '')}
        ${o.done ? `<div class="nsd-ev-sub">${o.annoyed ? '😠 Verzockt – nur noch das Anfangsangebot, der Sponsor ist genervt.' : 'Mehr ist nicht drin.'}</div>`
          : `<div class="nsd-hl-btns"><button class="nsd-btn" data-g="higher"><span class="lb">▲ Höher</span></button><button class="nsd-btn" data-g="lower"><span class="lb">▼ Niedriger</span></button>
             <div class="nsd-ev-sub">Versuch ${(o.steps ?? 0) + 1} von ${NEGO_MAX}</div></div>`}</div>
    </div>` : `<div class="nsd-card" style="font-size:1.2rem">Kein offenes Angebot.${managerOf(s) ? '' : ' Ohne Manager bekommst du keine Sponsor-Angebote.'}</div>`;
  const co = sp.cOffer, cards = co ? `${darkBar('⚠️ Umstrittenes Angebot', 'sm red')}<div class="nsd-offer ctrl">
      <div class="nsd-ev-name">⚠️ ${esc(co.name)}</div>
      <div class="nsd-ev-sub">${esc(co.sector)} · ${esc(co.tag)} · ${co.length} Wochen · noch ${co.weeks} Woche${co.weeks > 1 ? 'n' : ''} gültig</div>
      <div class="nsd-offer-val">${coin(co.perWeek)} <small>pro Woche</small></div>
      <div class="nsd-ev-sub">${co.perWeek} ★/Woche · ${co.win} ★ je Sieg</div>
      <div class="nsd-ev-sub neg">Sehr gut bezahlt – aber riskant: Skandale, Sponsoren-Flucht, Krisen-PR und Manager-Krach können den Deal zum Verlustgeschäft machen – unterm Strich lohnt sich knapp die Hälfte nicht. Sofort ${CONTROVERSY_SIGN_FANS} Fans. Zählt nicht zu deinen ${SPONSOR_MAX} Plätzen, keine Branchenregel.</div>
      <div class="nsd-hl-btns"><button class="nsd-btn" id="c-yes"><span class="lb">Annehmen</span></button><button class="nsd-btn" id="c-no"><span class="lb">Ablehnen</span></button></div>
    </div>` : '';
  return frame({
    body: `${header(p.name)}${titleBand('Sponsoren')}
      ${cards}
      ${darkBar(`Laufende Verträge (${normalContracts(s).length}/${SPONSOR_MAX}${sp.active.some(c => c.controversial) ? ' + 1 umstritten' : ''})`, 'sm')}
      <div class="nsd-evs">${sp.active.map(c => `<div class="nsd-ev"><div class="nsd-ev-main"><div class="nsd-ev-name">${brancheOf(c).icon} ${esc(c.name)}</div>
        <div class="nsd-ev-sub">${brancheOf(c).label}${brand(c)}</div><div class="nsd-ev-sub">${terms({ perWeek: c.perWeek, win: c.win ?? 0, s180: c.s180, major: c.major })} · noch ${c.weeksLeft} Wochen</div></div>
        <button class="nsd-btn" data-cancel="${esc(c.name)}"><span class="lb">Kündigen</span></button></div>`).join('') || '<div class="nsd-ev-sub" style="padding:4px 6px">Noch keine Sponsoren.</div>'}</div>
      ${darkBar('Angebot', 'sm')}${sponsorBlockWeeks(s) > 0 ? `<div class="nsd-card nsd-ev-sub neg" style="margin:6px 10px">🚫 Sponsoren-Sperre nach dem Skandal: noch ${sponsorBlockWeeks(s)} Woche${sponsorBlockWeeks(s) > 1 ? 'n' : ''} keine neuen Angebote.</div>` : ''}${offer}`,
    bottom: bar(o ? [{ id: 'o-no', icon: '✖', label: 'Ablehnen' }, { go: 'team', icon: nicon('team'), label: 'Team' }, { id: 'o-yes', icon: checkIcon(), label: 'Unterschreiben', wide: true }]
      : [{ go: 'hub', icon: nicon('home'), label: 'Start' }, { go: 'life', icon: nicon('life'), label: 'Leben' }, { go: 'team', icon: nicon('team'), label: 'Team', wide: true }]),
  });
}
export function mount(root, app) {
  const s = app.state;
  bindHead(root, app, HELP);
  root.querySelectorAll('[data-g]').forEach(b => b.onclick = () => {
    try { const r = negotiate(s, b.dataset.g, new RNG(s.rng)); app.save(); app.go('sponsors', { last: r }); } catch (e) { toast(e.message, 'error'); }
  });
  const sign = cancel => { try { acceptOffer(s, cancel); app.save(); toast('Vertrag unterschrieben!'); app.go('sponsors'); } catch (e) { toast(e.message, 'error'); } };
  root.querySelector('#o-yes')?.addEventListener('click', async () => {
    const cf = offerConflict(s, s.nsdSponsors.offer);
    if (!cf) return sign(null);
    if (cf.kind === 'branche') {
      if (await confirmDialog('Vertrag ersetzen?', `In dieser Branche läuft schon ${esc(cf.drop)} – der alte Vertrag wird gekündigt.`, 'Ersetzen')) sign(null);
      return;
    }
    modal({ title: `Welchen Sponsor kündigen?`, body: `<span class="mm-pick"></span><p>Du hast schon ${SPONSOR_MAX} Sponsoren. Für ${esc(s.nsdSponsors.offer.name)} muss einer gehen:</p>`,
      actions: [...s.nsdSponsors.active.map(c => ({ label: `${c.name} (${c.perWeek} ★/Woche)`, cls: 'btn-primary', onClick: () => { setTimeout(() => sign(c.name), 0); } })), { label: 'Abbrechen' }] });
  });
  root.querySelector('#c-yes')?.addEventListener('click', async () => {
    if (!await confirmDialog('Umstrittenen Deal annehmen?', `${esc(s.nsdSponsors.cOffer.name)} zahlt sehr gut – Fans und andere Sponsoren könnten das übel nehmen.`, 'Annehmen')) return;
    try { acceptControversial(s); app.save(); toast('Vertrag unterschrieben – die Fans murren.'); app.go('sponsors'); } catch (e) { toast(e.message, 'error'); }
  });
  root.querySelector('#c-no')?.addEventListener('click', () => { declineControversial(s); app.save(); app.go('sponsors'); });
  root.querySelectorAll('[data-cancel]').forEach(b => b.onclick = async () => {
    if (!await confirmDialog('Vertrag kündigen?', `${esc(b.dataset.cancel)} wird sofort gekündigt (kostenlos).`, 'Kündigen')) return;
    cancelSponsor(s, b.dataset.cancel); app.save(); app.go('sponsors');
  });
  root.querySelector('#o-no')?.addEventListener('click', () => { declineOffer(s); app.save(); app.go('sponsors'); });
}
