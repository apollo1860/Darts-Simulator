// Schnellsimulation zum Zuschauen (DartConnect-Stil): 1 Aufnahme alle 1,5 s, alle Scores sichtbar.
// Eigener Spieler links. Rot = Leg-Average, Weiß = Gesamt-Average.
import { esc, fmtNum } from '../../util.js';
import { getPlayer } from '../../world.js';
import { formatLabel } from '../../matchEngine.js';
import { legAverage, liveAverage } from '../../matchState.js';
import { playerMatch, startManualMatch, liveAiVisit, finishManualMatch, simulateLiveRest, nextRound } from '../../tournaments.js';
import { confirmDialog } from '../components.js';

export const VISIT_MS = 1500;
let ui = null;

export function render(app) {
  const inst = app.state.activeEvent, pm = inst && playerMatch(inst);
  if (!pm || pm.winner) return '<div class="panel">Kein offenes Match.</div>';
  const round = inst.rounds[inst.current];
  return `<div class="watch-screen">
    <header class="topbar">
      <button class="back-btn" data-go="event" aria-label="Zurück">◂</button>
      <div class="title"><h2>${esc(round.name)}</h2><div class="sub">${esc(inst.name)} · ${formatLabel(round.format)}</div></div>
    </header>
    <div class="dc" id="dc"></div>
    <div class="watch-controls">
      <button class="btn btn-sm" id="w-pause">Pause</button>
      <button class="btn btn-sm btn-gold" id="w-self">🎯 Selbst spielen</button>
      <button class="btn btn-sm btn-ghost" id="w-end">Sofort beenden</button>
    </div>
  </div>`;
}

export function mount(root, app) {
  const s = app.state;
  const live = startManualMatch(s);
  app.save();
  const pm = playerMatch(s.activeEvent);
  ui = { app, s, live, me: live.me, ids: [pm.a, pm.b], timer: 0, paused: false, showLast: false, el: root.querySelector('#dc') };
  root.querySelector('#w-pause').onclick = e => {
    ui.paused = !ui.paused;
    e.target.textContent = ui.paused ? 'Weiter' : 'Pause';
    if (!ui.paused) schedule(400);
  };
  root.querySelector('#w-self').onclick = () => app.go('match');
  root.querySelector('#w-end').onclick = async () => {
    if (!await confirmDialog('Sofort beenden?', 'Der Rest des Matches wird ohne Anzeige simuliert.', 'Beenden')) return;
    if (!ui) return;
    const { s: st, app: ap } = ui;
    simulateLiveRest(st); nextRound(st); ap.save(); ap.go('event', { showResult: true });
  };
  draw();
  schedule(VISIT_MS);
}

export function unmount() { if (ui) clearTimeout(ui.timer); ui = null; }

function schedule(ms) {
  clearTimeout(ui.timer);
  ui.timer = setTimeout(step, ms);
}

function step() {
  if (!ui || ui.paused) return;
  const m = ui.live.m;
  if (m.done) return finish();
  ui.showLast = false;
  const ev = liveAiVisit(ui.s);
  ui.app.save();
  if (ev?.legEnd) ui.showLast = true;   // abgeschlossenes Leg noch kurz zeigen
  draw(ev);
  if (m.done) { ui.timer = setTimeout(() => ui && finish(), VISIT_MS * 1.5); return; }
  schedule(ev?.legEnd ? VISIT_MS * 1.6 : VISIT_MS);
}

function finish() {
  const { s, app } = ui;
  finishManualMatch(s); nextRound(s); app.save();
  app.go('event', { showResult: true });
}

// ---------- Darstellung ----------
function draw(ev) {
  const m = ui.live.m, me = ui.me, op = 1 - me;
  const last = ui.showLast && m.lastLeg;
  const visits = last ? m.lastLeg.visits : (m.legVisits ?? [[], []]);
  const rem = last ? m.lastLeg.rem : m.rem;
  const legAvg = i => (last ? m.lastLeg.avg[i] : legAverage(m, i));
  const starter = last ? m.lastLeg.starter : m.legStarter;
  const active = last || m.done ? -1 : m.turn;
  const legNo = m.legs[0] + m.legs[1] + (last || m.done ? 0 : 1);

  const head = (i, side) => {
    const p = getPlayer(ui.s, ui.ids[i]);
    const stats = `<div class="dc-avgs"><span class="dc-legavg">${fmtNum(legAvg(i), 0)}</span><span class="dc-avg">${fmtNum(liveAverage(m, i), 0)}</span></div>`;
    const won = last && m.lastLeg.winner === i;
    return `<div class="dc-player ${side} ${active === i ? 'active' : ''} ${won ? 'won' : ''}">
      <div class="dc-name">${starter === i ? '<i class="dc-dot"></i>' : ''}<span class="dc-nm" title="${esc(p.name)}">${esc(shortName(p.name))}</span></div>
      <div class="dc-scorebox">${side === 'left' ? stats : ''}<span class="dc-rem">${rem[i]}</span>${side === 'right' ? stats : ''}</div>
    </div>`;
  };
  const rows = Math.max(visits[0].length, visits[1].length, 1);
  const nextRow = active >= 0 ? visits[active].length : -1;
  const cell = (i, r, side) => {
    const v = visits[i][r];
    const arrow = active === i && r === nextRow ? `<i class="dc-arrow ${side}"></i>` : '';
    if (!v) return `<div class="dc-cell ${side}">${arrow}</div>`;
    const cls = v.checkout ? 'co' : v.bust ? 'bust' : v.score >= 100 ? 'ton' : '';
    const isNew = ev?.visitEnd && ev.player === i && r === visits[i].length - 1 ? 'new' : '';
    return `<div class="dc-cell ${side} ${cls} ${isNew}">${v.bust ? '0' : v.score}${v.checkout ? '<small>✓</small>' : ''}</div>`;
  };
  let body = '';
  for (let r = 0; r < Math.max(rows, nextRow + 1); r++) {
    body += `<div class="dc-row">${cell(me, r, 'left')}<div class="dc-no">${r + 1}</div>${cell(op, r, 'right')}</div>`;
  }
  const setsTxt = m.format.sets ? `<div class="dc-sets">Sätze ${m.sets[me]}:${m.sets[op]}</div>` : '';
  const banner = last ? `<div class="dc-banner">Leg · ${esc(getPlayer(ui.s, ui.ids[m.lastLeg.winner]).name)}</div>` : '';
  ui.el.innerHTML = `
    <div class="dc-top">
      ${head(me, 'left')}
      <div class="dc-mid"><div class="dc-badge"><small>Legs</small>${m.legs[me]}:${m.legs[op]}</div>${setsTxt}<div class="dc-legno">Leg ${legNo}</div></div>
      ${head(op, 'right')}
    </div>
    ${banner}
    <div class="dc-list" id="dc-list">${body}</div>`;
  const list = ui.el.querySelector('#dc-list');
  list.scrollTop = list.scrollHeight;
}

// Wie bei DartConnect: Nachname
const shortName = n => n.trim().split(/\s+/).slice(-1)[0];
