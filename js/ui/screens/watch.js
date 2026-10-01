// Schnellsimulation zum Zuschauen (DartConnect-Stil): 1 Aufnahme alle 1,5 s, alle Scores sichtbar.
// Eigener Spieler links. Rot = Leg-Average, Weiß = Gesamt-Average.
import { esc, fmtNum } from '../../util.js';
import { getPlayer } from '../../world.js';
import { formatLabel } from '../../matchEngine.js';
import { legAverage, liveAverage } from '../../matchState.js';
import { playerMatch, startManualMatch, liveAiVisit, finishManualMatch, simulateLiveRest, nextRound, liveDartStep, oppMatchDartVisit } from '../../tournaments.js';
import { boardSvg, regionPath } from '../boardSvg.js';
import { confirmDialog, modal } from '../components.js';
import { planDistraction, distractionDue, describe, resolveDistraction } from '../../distractions.js';
import { checkoutDecisionDue, chooseRoute } from '../../decisions.js';
import { fieldName } from '../../board.js';
import { fmtPct } from '../../util.js';
import { stageFactor, stageDelta, momentumState } from '../../form.js';

export const VISIT_MS = 1500;
const BOGEY = new Set([169, 168, 166, 165, 163, 162, 159]);
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
    <div class="dc-board hidden" id="dc-board"></div>
    <div class="watch-controls">
      <button class="btn btn-sm" id="w-pause">Pause</button>
      <button class="btn btn-sm btn-ghost" id="w-end">Sofort beenden</button>
    </div>
  </div>`;
}

export function mount(root, app) {
  const s = app.state;
  const live = startManualMatch(s);
  planDistraction(s);
  app.save();
  const pm = playerMatch(s.activeEvent);
  ui = { app, s, live, me: live.me, ids: [pm.a, pm.b], timer: 0, paused: false, showLast: false, el: root.querySelector('#dc'),
    boardEl: root.querySelector('#dc-board'), board: null };
  root.querySelector('#w-pause').onclick = e => {
    ui.paused = !ui.paused;
    e.target.textContent = ui.paused ? 'Weiter' : 'Pause';
    if (!ui.paused) schedule(400);
  };
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
  if (ui.board) return boardDart();
  if (m.done) return finish();
  ui.showLast = false;
  if (distractionDue(ui.s)) return askDistraction();
  const co = checkoutDecisionDue(ui.s);
  if (co) { ui.app.save(); return askCheckout(co); }
  if (oppMatchDartVisit(ui.s)) return startBoard();
  const ev = liveAiVisit(ui.s);
  ui.app.save();
  if (ev?.legEnd) ui.showLast = true;   // abgeschlossenes Leg noch kurz zeigen
  draw(ev);
  if (m.done) { ui.timer = setTimeout(() => ui && finish(), VISIT_MS * 1.5); return; }
  schedule(ev?.legEnd ? VISIT_MS * 1.6 : VISIT_MS);
}

// ---- Gegner-Matchdarts: Wurf für Wurf auf der Scheibe ----
const BOARD_DART_MS = 1100;
function startBoard() {
  const m = ui.live.m, op = m.turn, name = getPlayer(ui.s, ui.ids[op]).name;
  ui.board = { side: op, start: m.rem[op], n: 0, lines: [] };
  ui.boardEl.classList.remove('hidden');
  ui.boardEl.innerHTML = `<div class="dc-bd-head">⚠️ MATCHDARTS · ${esc(shortName(name))} steht auf <b>${m.rem[op]}</b></div>
    <div class="dc-bd-stage"><svg viewBox="-200 -200 400 400" aria-label="Dartscheibe">${boardSvg()}
      <path class="target-region" id="bd-region" d=""/><g id="bd-marks"></g></svg>
      <div class="board-banner" id="bd-banner"></div></div>
    <div class="dc-bd-log" id="bd-log"></div>`;
  schedule(900);
}
function boardDart() {
  const b = ui.board, root = ui.boardEl;
  const r = liveDartStep(ui.s);
  ui.app.save();
  b.n++;
  const { dart, ev } = r;
  root.querySelector('#bd-region').setAttribute('d', dart.target === 'OUT' ? '' : regionPath(dart.target));
  const NS = 'http://www.w3.org/2000/svg', g = document.createElementNS(NS, 'g');
  g.setAttribute('class', 'dart-mark opp');
  g.setAttribute('transform', `translate(${dart.x.toFixed(1)} ${dart.y.toFixed(1)})`);
  g.innerHTML = '<circle r="6"/><circle r="2" class="core"/>';
  root.querySelector('#bd-marks').appendChild(g);
  const hitTxt = ev.checkout ? '<b class="neg">CHECK!</b>' : ev.bust ? '<b class="pos">Überworfen!</b>' : `${fieldName(dart.hit.label)}${dart.hit.mult > 1 ? ` (${dart.hit.score})` : ''}`;
  root.querySelector('#bd-log').insertAdjacentHTML('beforeend', `<div>Dart ${b.n}: Ziel <b>${fieldName(dart.target)}</b> → ${hitTxt}</div>`);
  draw(r.visitOver ? ev : null);
  if (!r.visitOver) return schedule(BOARD_DART_MS);
  const bn = root.querySelector('#bd-banner');
  bn.textContent = ev.checkout ? 'Matchdart verwandelt' : 'Überstanden!';
  bn.className = `board-banner show ${ev.checkout ? 'bust' : 'leg'}`;
  ui.timer = setTimeout(() => {
    if (!ui) return;
    ui.board = null; ui.boardEl.classList.add('hidden'); ui.boardEl.innerHTML = '';
    if (ev?.legEnd) ui.showLast = true;
    draw(ev);
    if (ui.live.m.done) { ui.timer = setTimeout(() => ui && finish(), VISIT_MS); return; }
    schedule(VISIT_MS);
  }, 1800);
}

// Störmoment: Spiel pausiert, 2 Optionen mit Erfolgschance
function askDistraction() {
  const s = ui.s, d = describe(s, ui.live.dist);
  ui.paused = true;
  modal({
    title: `${d.icon} ${d.title}`,
    dismissable: false,
    body: `<p>${esc(d.text)}</p><p class="muted" style="font-size:.82rem">Wie reagierst du? Die Chance hängt von Fokus bzw. Mental und deiner Erfahrung ab.</p>
      <div class="stack">${d.options.map((o, i) => `<button class="panel choice" data-choice="${i}">
        <div class="row-between"><b>${esc(o.label)}</b><span class="badge ${o.chance >= 0.5 ? 'badge-green' : ''}">${fmtPct(o.chance, 0)}</span></div>
        <div class="muted" style="font-size:.78rem">${o.attr === 'foc' ? 'Fokus' : 'Mental'} · ${o.base >= 0.55 ? 'sicher, kleiner Effekt' : 'riskant, großer Effekt'}</div></button>`).join('')}</div>`,
    actions: [],
    onMount: bd => bd.querySelectorAll('[data-choice]').forEach(btn => btn.onclick = () => { bd.remove(); answer(+btn.dataset.choice); }),
  });
}

// Checkout-Entscheidung: Weg wählen (Chancen sind Schätzungen – Rechnen bestimmt die Genauigkeit)
function askCheckout(co) {
  ui.paused = true;
  modal({
    title: `🎯 ${co.rem} Rest – welcher Weg?`,
    dismissable: false,
    body: `<p class="muted" style="font-size:.84rem">Du stehst auf <b>${co.rem}</b>. Geschätzte Chance, ihn in dieser Aufnahme zu checken${co.cal < 60 ? ' (dein Rechnen ist schwach – die Schätzung kann daneben liegen)' : ''}:</p>
      <div class="stack">${co.opts.map((o, i) => `<button class="panel choice" data-route="${i}">
        <div class="row-between"><b style="font-size:1.1rem">${o.route.map(fieldName).join(' · ')}</b>
          <span class="badge ${o.shown >= 35 ? 'badge-green' : ''}">≈ ${o.shown} %</span></div>
        ${co.recommended === i ? '<div class="gold" style="font-size:.78rem;font-weight:700">★ Empfohlen</div>' : ''}
      </button>`).join('')}</div>`,
    actions: [],
    onMount: bd => bd.querySelectorAll('[data-route]').forEach(btn => btn.onclick = () => {
      bd.remove();
      if (!ui) return;
      chooseRoute(ui.s, co.rem, co.opts[+btn.dataset.route].route);
      ui.paused = false; ui.app.save(); schedule(400);
    }),
  });
}

function answer(i) {
  if (!ui) return;
  const r = resolveDistraction(ui.s, i);
  ui.app.save();
  modal({
    title: r.ok ? '✅ Geklappt' : '❌ Ging schief',
    dismissable: false,
    body: `<p>${esc(r.text)}</p><p class="muted" style="font-size:.8rem">„${esc(r.label)}“ · Chance war ${fmtPct(r.chance, 0)}</p>`,
    actions: [{ label: 'Weiter', cls: 'btn-primary', onClick: () => { if (!ui) return; ui.paused = false; draw(); schedule(600); } }],
  });
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
      <div class="dc-name">${modTag(i)}${starter === i ? '<i class="dc-dot"></i>' : ''}<span class="dc-nm" title="${esc(p.name)}">${esc(shortName(p.name))}</span></div>
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
    const bogey = !v.checkout && !v.bust && BOGEY.has(v.rem) ? '<small class="dc-bogey" title="Bogey-Rest – nicht in 3 Darts checkbar">⚠</small>' : '';
    const isNew = ev?.visitEnd && ev.player === i && r === visits[i].length - 1 ? 'new' : '';
    return `<div class="dc-cell ${side} ${cls} ${isNew}">${v.bust ? '0' : v.score}${v.checkout ? '<small>✓</small>' : ''}${bogey}</div>`;
  };
  let body = '';
  for (let r = 0; r < Math.max(rows, nextRow + 1); r++) {
    body += `<div class="dc-row">${cell(me, r, 'left')}<div class="dc-no">${r + 1}</div>${cell(op, r, 'right')}</div>`;
  }
  const setsTxt = m.format.sets ? `<div class="dc-sets">Sätze ${m.sets[me]}:${m.sets[op]}</div>` : '';
  const mods = (ui.live.mods ?? []);
  const modTag = side => { const mm = mods.filter(x => x.side === side); if (!mm.length) return ''; const v = mm.reduce((a, x) => a * x.mult, 1); return `<span class="dc-mod" title="${v > 1 ? 'gestört' : 'Rückenwind'}">${v > 1 ? '😤' : '🔥'}</span>`; };
  const banner = last ? `<div class="dc-banner">Leg · ${esc(getPlayer(ui.s, ui.ids[m.lastLeg.winner]).name)}</div>` : '';
  ui.el.innerHTML = `
    <div class="dc-top">
      ${head(me, 'left')}
      <div class="dc-mid"><div class="dc-badge"><small>Legs</small>${m.legs[me]}:${m.legs[op]}</div>${setsTxt}<div class="dc-legno">Leg ${legNo}</div></div>
      ${head(op, 'right')}
    </div>
    ${banner}${formLine()}
    <div class="dc-list" id="dc-list">${body}</div>`;
  const list = ui.el.querySelector('#dc-list');
  list.scrollTop = list.scrollHeight;
}

// Bühne (Erfahrung zählt) und Selbstvertrauen des eigenen Spielers
function formLine() {
  const s = ui.s, inst = s.activeEvent, f = stageFactor(inst, ui.ids[0], ui.ids[1]);
  const parts = [];
  const ms = momentumState(s.player);
  if (ms.bonus) parts.push(`<span class="${ms.bonus > 0 ? 'pos' : 'neg'}">${ms.icon} ${ms.label} ${ms.bonus > 0 ? '+' : ''}${ms.bonus}</span>`);
  if (f) {
    const exp = i => (inst.teams?.[ui.ids[i]] ?? getPlayer(s, ui.ids[i])).exp ?? 0;
    const d = i => { const v = stageDelta(exp(i), f); return `${v >= 0 ? '+' : ''}${fmtNum(v, 1)}`; };
    parts.push(`<span class="gold" title="Auf der großen Bühne zählt Erfahrung: ±0,5 je Stufe über/unter +3">🎭 ${f >= 1.5 ? 'Große Bühne' : f >= 1 ? 'Bühne' : 'Großer Name'}: du ${d(ui.me)} · Gegner ${d(1 - ui.me)}</span>`);
  }
  return parts.length ? `<div class="dc-form">${parts.join(' · ')}</div>` : '';
}

// Wie bei DartConnect: Nachname
const shortName = n => n.trim().split(/\s+/).slice(-1)[0];
