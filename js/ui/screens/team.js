// Team: Manager (Provision, Sponsoren, Exhibition-Einladungen) und Trainer (1 Jahr, mehr XP)
import { esc, fmtEUR } from '../../util.js';
import { MANAGERS, COACHES } from '../../../data/staff.js';
import { staffOf, managerAvailable, hireManager, fireManager, coachActive, hireCoach } from '../../staff.js';
import { topbar, confirmDialog, toast } from '../components.js';

const stars = n => '★'.repeat(n) + '☆'.repeat(3 - n);

export function render(app) {
  const s = app.state, st = staffOf(s), m = st.manager, c = coachActive(s);
  return `${topbar({ title: 'Team', sub: 'Manager & Trainer', money: s.finance.balance })}
  <div class="section-title"><span class="label">👔 Manager</span></div>
  ${m ? `<div class="panel stack">
      <div class="row-between"><div><b>${esc(m.name)}</b> <span class="gold">${stars(m.tier)}</span>
        <div class="muted" style="font-size:.8rem">seit KW ${m.since.week}/${m.since.year} · Provision ${Math.round(m.cut * 100)} % · bisher ${fmtEUR(m.paid ?? 0)}</div></div>
        <button class="btn btn-sm btn-ghost" id="fire">Trennen</button></div>
      <div class="muted" style="font-size:.82rem">Sponsorangebote ${Math.round(m.offer * 100)} % statt 60 % · Beträge +${Math.round((m.amount - 1) * 100)} % · bis ${m.maxOffers} offene Angebote · Exhibition-Gagen ×${m.gigFee} · Einladungen zu Exhibitions (${Math.round(m.gig * 100)} % pro Woche, zusätzlich zum Wochenplan)</div>
    </div>` : '<div class="muted" style="font-size:.84rem;margin-bottom:8px">Ein Manager nimmt einen Anteil an allen Einnahmen (Preisgeld, Sponsoren, Exhibitions), bringt dafür mehr und bessere Sponsoren und bucht dir Exhibitions.</div>'}
  <div class="stack" style="margin-top:8px">${MANAGERS.filter(x => x.id !== m?.id).map(x => {
    const av = managerAvailable(s, x);
    return `<div class="panel row-between">
      <div><b>${esc(x.name)}</b> <span class="gold">${stars(x.tier)}</span>
        <div class="muted" style="font-size:.8rem">${esc(x.note)} · Provision <b>${Math.round(x.cut * 100)} %</b> · Sponsoren +${Math.round((x.amount - 1) * 100)} % · Gagen ×${x.gigFee}</div></div>
      <button class="btn btn-sm ${av.ok ? 'btn-primary' : ''}" data-mgr="${x.id}" ${av.ok ? '' : 'disabled'}>${av.ok ? (m ? 'Wechseln' : 'Verpflichten') : esc(av.reason)}</button>
    </div>`;
  }).join('')}</div>

  <div class="section-title"><span class="label">🧑‍🏫 Trainer</span></div>
  ${c ? `<div class="panel"><b>${esc(c.name)}</b> <span class="gold">${stars(c.tier)}</span>
      <div class="muted" style="font-size:.8rem">+${Math.round(c.xp * 100)} % XP und schnellerer Trainingsfortschritt · Vertrag bis KW ${c.until.week}/${c.until.year}</div></div>`
    : '<div class="muted" style="font-size:.84rem;margin-bottom:8px">Einmalzahlung für 1 Jahr. Der Trainer erhöht alle XP (Turniere, Training, Exhibitions) und beschleunigt den Trainingsfortschritt.</div>'}
  <div class="stack" style="margin-top:8px">${c ? '' : COACHES.map(x => {
    const ok = s.finance.balance >= x.price;
    return `<div class="panel row-between">
      <div><b>${esc(x.name)}</b> <span class="gold">${stars(x.tier)}</span>
        <div class="muted" style="font-size:.8rem">${esc(x.note)} · <b class="pos">+${Math.round(x.xp * 100)} % XP</b> · ${fmtEUR(x.price)} für 1 Jahr</div></div>
      <button class="btn btn-sm ${ok ? 'btn-primary' : ''}" data-coach="${x.id}" ${ok ? '' : 'disabled'}>${ok ? 'Verpflichten' : 'Zu teuer'}</button>
    </div>`;
  }).join('')}</div>`;
}

export function mount(root, app) {
  root.querySelector('#fire')?.addEventListener('click', async () => {
    if (!await confirmDialog('Manager entlassen?', 'Offene Exhibition-Einladungen verfallen. Sponsorverträge bleiben bestehen.', 'Trennen', 'btn-danger')) return;
    fireManager(app.state); app.save(); app.refresh();
  });
  root.querySelectorAll('[data-mgr]').forEach(b => b.onclick = async () => {
    const x = MANAGERS.find(m => m.id === b.dataset.mgr);
    if (!await confirmDialog(`${x.name} verpflichten?`, `Provision ${Math.round(x.cut * 100)} % auf alle Einnahmen. Jederzeit kündbar.`, 'Unterschreiben')) return;
    if (hireManager(app.state, x.id)) { toast('Manager verpflichtet'); app.save(); }
    app.refresh();
  });
  root.querySelectorAll('[data-coach]').forEach(b => b.onclick = async () => {
    const x = COACHES.find(c => c.id === b.dataset.coach);
    if (!await confirmDialog(`${x.name} verpflichten?`, `${fmtEUR(x.price)} einmalig für 1 Jahr, +${Math.round(x.xp * 100)} % XP.`, 'Bezahlen')) return;
    if (hireCoach(app.state, x.id)) { toast('Trainer verpflichtet'); app.save(); }
    app.refresh();
  });
}
