// Wohnen & Auto: Wohnung wählen (ab Auszug mit 18), Auto-Shop (ab 18)
import { esc, fmtEUR, fmtNum } from '../../util.js';
import { HOMES, CARS, MOVE_AGE, CAR_RESALE, homeOf, carOf, rentOf, carPrice, upkeepOf, moveDue, chooseHome, buyCar } from '../../home.js';
import { topbar, confirmDialog, toast } from '../components.js';

const sign = v => (v > 0 ? `+${fmtNum(v, 1)}` : fmtNum(v, 1));

export function render(app) {
  const s = app.state, p = s.player, lvl = p.level ?? 1, h = homeOf(p), c = carOf(p);
  const due = moveDue(s), canMove = !!p.home || due;
  const effects = x => `Erholung ${sign(x.rec)} %/Woche · Selbstvertrauen ${sign(x.mom)}/Woche${x.malus ? ` · <span class="neg">−${x.malus} auf alle Attribute</span>` : ''}`;
  const resale = p.car ? Math.round((p.car.paid ?? 0) * CAR_RESALE / 5) * 5 : 0;
  return `${topbar({ title: 'Wohnen & Auto', sub: `Preisniveau Level ${lvl}`, money: s.finance.balance })}
  ${due ? `<div class="panel warn" style="margin-bottom:12px">📦 <b>Du musst ausziehen!</b> <span class="muted">Wähle eine Wohnung – sonst geht es ins Studentenwohnheim.</span></div>` : ''}
  <div class="section-title"><span class="label">🏠 Wohnung</span></div>
  <div class="panel" style="margin-bottom:8px">${h ? `<b>${h.icon} ${esc(h.label)}</b> <span class="muted">seit KW ${p.home.week}/${p.home.year}</span>
      <div class="muted" style="font-size:.8rem">${effects(h)} · nächste Jahresmiete (KW 1): ${fmtEUR(rentOf(h, lvl))}</div>`
    : `<b>🏡 Elternhaus</b> <span class="muted">mietfrei</span><div class="muted" style="font-size:.8rem">Mit ${MOVE_AGE} musst du ausziehen – irgendwann in dem Jahr kommt die Meldung.</div>`}</div>
  <div class="stack">${HOMES.filter(x => x.id !== h?.id).map(x => {
    const rent = rentOf(x, lvl), ok = canMove && s.finance.balance >= rent;
    return `<div class="panel row-between">
      <div><b>${x.icon} ${esc(x.label)}</b> <span class="gold num">${fmtEUR(rent)}/Jahr</span>
        <div class="muted" style="font-size:.78rem">${esc(x.text)}<br>${effects(x)}</div></div>
      <button class="btn btn-sm ${ok ? 'btn-primary' : ''}" data-home="${x.id}" ${ok ? '' : 'disabled'}>${!canMove ? `Ab ${MOVE_AGE}` : ok ? (h ? 'Umziehen' : 'Einziehen') : 'Zu teuer'}</button>
    </div>`;
  }).join('')}</div>
  <div class="muted" style="font-size:.76rem;margin-top:6px">Jahresmiete wird beim Einzug und dann jedes Jahr in KW 1 komplett fällig. Mieten steigen mit deinem Level (außer Wohnheim).</div>

  <div class="section-title"><span class="label">🚘 Auto-Shop</span></div>
  <div class="panel" style="margin-bottom:8px">${c ? `<b>${c.icon} ${esc(c.label)}</b> <span class="muted">seit ${p.car.year}</span>
      <div class="muted" style="font-size:.8rem">Reisekosten −${Math.round(c.travel * 100)} % · Wartung & Versicherung ${fmtEUR(upkeepOf(c, lvl))}/Jahr (KW 1) · Wiederverkauf ${fmtEUR(resale)}</div>`
    : `<b>🚆 Kein Auto</b><div class="muted" style="font-size:.8rem">${p.age < MOVE_AGE ? `Führerschein ab ${MOVE_AGE}.` : 'Mit eigenem Auto werden alle Reisen günstiger.'}</div>`}</div>
  <div class="stack">${CARS.filter(x => x.id !== c?.id).map(x => {
    const price = carPrice(x, lvl), net = price - resale, ok = p.age >= MOVE_AGE && s.finance.balance >= net;
    return `<div class="panel row-between">
      <div><b>${x.icon} ${esc(x.label)}</b> <span class="gold num">${fmtEUR(price)}</span>
        <div class="muted" style="font-size:.78rem"><b class="pos">Reisekosten −${Math.round(x.travel * 100)} %</b> · Wartung ${fmtEUR(upkeepOf(x, lvl))}/Jahr${resale ? ` · mit Inzahlungnahme ${fmtEUR(net)}` : ''}</div></div>
      <button class="btn btn-sm ${ok ? 'btn-primary' : ''}" data-car="${x.id}" ${ok ? '' : 'disabled'}>${p.age < MOVE_AGE ? `Ab ${MOVE_AGE}` : ok ? 'Kaufen' : 'Zu teuer'}</button>
    </div>`;
  }).join('')}</div>`;
}

export function mount(root, app) {
  root.querySelectorAll('[data-home]').forEach(b => b.onclick = async () => {
    const s = app.state, x = HOMES.find(h => h.id === b.dataset.home), rent = rentOf(x, s.player.level ?? 1);
    if (!await confirmDialog(`${x.label}?`, `Jahresmiete ${fmtEUR(rent)} wird sofort fällig${s.player.home ? ' (die alte Miete wird nicht erstattet)' : ''}.`, 'Mieten')) return;
    const r = chooseHome(s, x.id);
    toast(r.ok ? `${x.icon} ${x.label} bezogen` : r.reason); if (r.ok) app.save();
    app.refresh();
  });
  root.querySelectorAll('[data-car]').forEach(b => b.onclick = async () => {
    const s = app.state, x = CARS.find(c => c.id === b.dataset.car), price = carPrice(x, s.player.level ?? 1);
    if (!await confirmDialog(`${x.label} kaufen?`, `${fmtEUR(price)}${s.player.car ? `, dein altes Auto geht für ${Math.round(CAR_RESALE * 100)} % des Kaufpreises weg` : ''}.`, 'Kaufen')) return;
    const r = buyCar(s, x.id);
    toast(r.ok ? `${x.icon} ${x.label} gekauft` : r.reason); if (r.ok) app.save();
    app.refresh();
  });
}
