// Sponsoren: Angebote annehmen/ablehnen, aktive Verträge (kündbar)
import { esc, fmtEUR } from '../../util.js';
import { SPONSOR_SLOTS, CONTRACT_TYPES } from '../../../data/sponsors.js';
import { sponsorsUnlocked, MAX_SPONSORS, marketValue, describeOffer, acceptOffer, declineOffer, cancelContract } from '../../sponsors.js';
import { topbar, confirmDialog, toast } from '../components.js';

export function render(app) {
  const s = app.state, sp = s.sponsors;
  if (!sponsorsUnlocked(s)) {
    return `${topbar({ title: 'Sponsoren', sub: `max. ${MAX_SPONSORS} gleichzeitig` })}
    <div class="panel stack center">
      <div style="font-size:3rem">🔒</div><h3>Noch gesperrt</h3>
      <p class="muted">Sponsoren interessieren sich erst für dich, sobald du deine erste Tourcard gewonnen hast.
      Danach steigen Angebote mit Weltranglistenplatz und Erfolgen. Angebote erscheinen in den Neuigkeiten.</p>
    </div>`;
  }
  const slotOf = k => sp.active.find(c => c.slot === k);
  return `${topbar({ title: 'Sponsoren', sub: `${sp.active.length}/${MAX_SPONSORS} Verträge · Marktwert ${fmtEUR(marketValue(s))}/Jahr`, money: s.finance.balance })}
  <div class="kpi-grid">
    <div class="kpi"><div class="label">Aktive Verträge</div><div class="v">${sp.active.length}/${MAX_SPONSORS}</div></div>
    <div class="kpi"><div class="label">Offene Angebote</div><div class="v">${sp.offers.length}</div></div>
    <div class="kpi"><div class="label">Marktwert</div><div class="v num gold">${fmtEUR(marketValue(s))}</div></div>
    <div class="kpi"><div class="label">Sponsor-Einnahmen</div><div class="v num pos">${fmtEUR(sp.total ?? 0)}</div></div>
  </div>
  <div class="section-title"><span class="label">Vertragsplätze</span></div>
  <div class="tile-grid">${Object.entries(SPONSOR_SLOTS).map(([k, sl]) => {
    const c = slotOf(k);
    return `<div class="panel stack" style="min-height:140px">
      <div class="label">${sl.icon} ${sl.label}</div>
      ${c ? `<div><b>${esc(c.name)}</b><div class="muted" style="font-size:.8rem">${esc(describeOffer(c))}</div>
        <div class="muted" style="font-size:.78rem">bis Ende ${c.until} · erhalten ${fmtEUR(c.paid ?? 0)}</div></div>
        <button class="btn btn-sm btn-ghost" data-cancel="${esc(c.name)}">Kündigen</button>`
        : '<div class="dim">frei</div>'}
    </div>`;
  }).join('')}</div>
  <div class="section-title"><span class="label">Angebote</span></div>
  <div class="stack">${sp.offers.length ? sp.offers.map(o => {
    const busy = !!slotOf(o.slot);
    return `<div class="panel event-card">
      <div class="ev-head"><span class="tag tag-ddv">${SPONSOR_SLOTS[o.slot].icon} ${SPONSOR_SLOTS[o.slot].label}</span>
        <span class="muted" style="font-size:.8rem">gültig bis KW ${o.expires.week}</span></div>
      <div class="ev-name">${esc(o.name)}</div>
      <div>${esc(describeOffer(o))}</div>
      <div class="muted" style="font-size:.8rem">${CONTRACT_TYPES[o.type].info}</div>
      <div class="row-between">
        <div class="status-line ${busy ? 'no' : ''}">${busy ? `Platz belegt (${esc(slotOf(o.slot).name)}) – vorher kündigen` : 'Platz frei'}</div>
        <div class="row"><button class="btn btn-sm btn-ghost" data-decline="${o.id}">Ablehnen</button>
        <button class="btn btn-sm btn-primary" data-accept="${o.id}" ${busy ? 'disabled' : ''}>Annehmen</button></div>
      </div>
    </div>`;
  }).join('') : '<div class="panel muted">Aktuell keine Angebote – neue kommen etwa alle 4–8 Wochen über die Neuigkeiten.</div>'}</div>
  <p class="muted" style="font-size:.78rem;margin-top:12px">Je Kategorie ein Sponsor. Kündigung jederzeit ohne Kosten (bereits gezahlte Raten bleiben). Bessere Weltranglistenplätze bringen längere und höher dotierte Angebote.</p>`;
}

export function mount(root, app) {
  const s = app.state;
  root.querySelectorAll('[data-accept]').forEach(b => b.onclick = () => {
    const r = acceptOffer(s, b.dataset.accept);
    if (!r.ok) return toast(r.reason, 'error');
    toast('Vertrag unterschrieben!', 'success'); app.save(); app.refresh();
  });
  root.querySelectorAll('[data-decline]').forEach(b => b.onclick = () => { declineOffer(s, b.dataset.decline); app.save(); app.refresh(); });
  root.querySelectorAll('[data-cancel]').forEach(b => b.onclick = async () => {
    if (!await confirmDialog('Vertrag kündigen?', `${esc(b.dataset.cancel)} zahlt danach nichts mehr. Der Platz wird frei.`, 'Kündigen', 'btn-danger')) return;
    cancelContract(s, b.dataset.cancel); app.save(); app.refresh();
  });
}
