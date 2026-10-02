// Wochenübersicht: alle Events dieser Woche, Status, Melden
import { esc, fmtEUR, weekLabel } from '../../util.js';
import { flag, nationName } from '../../../data/nations.js';
import { CATEGORIES } from '../../../data/tournaments.js';
import { eventsInWeek, shownTo } from '../../calendar.js';
import { eventStatus, enterEvent } from '../../tournaments.js';
import { topbar, catTag, modal, toast } from '../components.js';

function costLine(ev, st) {
  const c = st.cost;
  const parts = [];
  if (ev.cat === 'local') parts.push('<span>Kostenlos</span>', `<span>Siegprämie <b class="gold">${fmtEUR(ev.prizeWin)}</b></span>`);
  else {
    if (ev.cat === 'wdf') parts.push(`<span>Siegprämie <b class="gold">${fmtEUR(ev.prizeWin)}</b></span>`, '<span>XP-Boost <b class="cyan">×1,2–1,6</b></span>');
    if (ev.pick) parts.push(`<span>Gebühr <b>${fmtEUR(c.fee)}</b> je Turnier</span>`, `<span>Reise <b>${fmtEUR(c.travel)}</b></span>`);
    else {
      if (c.fee) parts.push(`<span>Gebühr <b>${fmtEUR(c.fee)}</b></span>`);
      if (c.addOn) parts.push(`<span>Übernachtung extra <b>${fmtEUR(c.travel)}</b></span>`, '<span class="muted">nach dem Pro-Tour-Block</span>');
      else parts.push(`<span>Reise <b>${fmtEUR(c.travel)}</b></span>`, `<span>Gesamt <b>${fmtEUR(c.total)}</b></span>`);
    }
  }
  return `<div class="cost-list">${parts.join('')}</div>`;
}

export function render(app) {
  const s = app.state, { year, week } = s.date;
  const evs = eventsInWeek(s, year, week).filter(e => shownTo(s, e));
  return `${topbar({ title: 'Diese Woche', sub: weekLabel(year, week), money: s.finance.balance })}
  ${s.week.played ? '<div class="panel" style="margin-bottom:12px"><b>Diese Woche bist du bereits gemeldet.</b> <span class="muted">Pro Woche ist nur ein Event möglich.</span></div>' : ''}
  <div class="stack">
  ${evs.length ? evs.map(ev => {
    const st = eventStatus(s, ev);
    return `<div class="panel event-card ${st.playable ? '' : 'disabled'}">
      <div class="ev-head">${catTag(ev.cat)} <span class="muted" style="font-size:.8rem">${esc(CATEGORIES[ev.cat].label)}${ev.count > 1 ? ` · ${ev.pick ? 'bis zu ' : ''}${ev.count} Turniere` : ''}</span></div>
      <div class="ev-name">${esc(ev.name)}</div>
      <div class="muted" style="font-size:.86rem">${flag(ev.country)} ${esc(ev.city)}${ev.region ? `, ${esc(ev.region)}` : ev.city !== 'diverse' ? `, ${esc(nationName(ev.country))}` : ''}${ev.note ? ` · ${esc(ev.note)}` : ''}</div>
      ${costLine(ev, st)}
      <div class="row-between">
        <div class="status-line ${st.playable ? '' : 'no'}">${st.playable ? 'Meldung möglich' : esc(st.reason)}</div>
        ${st.playable ? `<button class="btn btn-primary btn-sm" data-enter="${ev.id}">Melden ▸</button>` : ''}
      </div>
    </div>`;
  }).join('') : '<div class="panel muted">Keine Events in dieser Woche.</div>'}
  </div>`;
}

// Blöcke mit Auswahl (CT/Dev/HNQ): wie viele Turniere spielst du selbst? (25 € je Turnier)
function pickCount(app, ev) {
  const s = app.state;
  const opts = Array.from({ length: ev.count }, (_, i) => i + 1).map(n => ({ n, st: eventStatus(s, ev, n) }));
  modal({
    title: 'Wie viele Turniere?',
    body: `<p><b>${esc(ev.name)}</b> in ${esc(ev.city)}</p>
      <p class="muted" style="font-size:.84rem">Du spielst die ersten gewählten Turniere des Wochenendes, der Rest läuft ohne dich.${ev.cat === 'hnq' ? ' Sobald du eins gewinnst, bist du im Hauptfeld – nicht gespielte Turniere werden erstattet.' : ''}</p>
      <div class="stack">${opts.map(o => `<button class="panel choice" data-n="${o.n}" ${o.st.playable ? '' : 'disabled'}>
        <div class="row-between"><b>${o.n} Turnier${o.n > 1 ? 'e' : ''}</b><span>${fmtEUR(o.st.cost.total)}</span></div>
        ${o.st.playable ? '' : `<div class="muted" style="font-size:.78rem">${esc(o.st.reason)}</div>`}</button>`).join('')}</div>`,
    actions: [{ label: 'Abbrechen', cls: 'btn-ghost' }],
    onMount: bd => bd.querySelectorAll('[data-n]').forEach(b => b.onclick = () => {
      bd.remove();
      try { enterEvent(s, ev.id, { count: +b.dataset.n }); app.save(); app.go('event'); }
      catch (e) { toast(e.message, 'error'); }
    }),
  });
}

export function mount(root, app) {
  root.querySelectorAll('[data-enter]').forEach(b => b.onclick = () => {
    const s = app.state;
    const ev = eventsInWeek(s, s.date.year, s.date.week).find(e => e.id === b.dataset.enter);
    if (ev.pick) return pickCount(app, ev);
    const st = eventStatus(s, ev);
    modal({
      title: 'Meldung bestätigen',
      body: `<p><b>${esc(ev.name)}</b> in ${esc(ev.city)}</p>
        <p class="muted">${st.cost.total ? `Kosten: ${fmtEUR(st.cost.total)} · Kontostand danach: ${fmtEUR(s.finance.balance - st.cost.total)}` : 'Keine Kosten.'}</p>
        <p class="muted">Danach ist diese Woche belegt.</p>`,
      actions: [{ label: 'Abbrechen', cls: 'btn-ghost' }, {
        label: 'Melden', cls: 'btn-primary', onClick: () => {
          try { enterEvent(s, ev.id); app.save(); app.go('event'); }
          catch (e) { toast(e.message, 'error'); }
        },
      }],
    });
  });
}
