// Manuelles Spiel: SVG-Dartscheibe, Zielwahl, Linien (vertikal → horizontal) per requestAnimationFrame
// mit Delta-/Absolutzeit, Gegner-KI, Scoreboard, „Rest simulieren“. Wird als Screen 'match' geladen.
import { ORDER, R, scoreAt, targetPoint, suggestTarget, checkoutRoute, fieldName, segAngle } from './board.js';
import { throwDart, dartsLeft, liveAverage, isDecider } from './matchState.js';
import { manualParams, wave } from './throwModel.js';
import { RNG } from './rng.js';
import { getPlayer } from './world.js';
import { formatLabel } from './matchEngine.js';
import { playerMatch, startManualMatch, liveAiDart, finishManualMatch, simulateLiveRest, nextRound } from './tournaments.js';
import { esc, fmtNum } from './util.js';
import { flag } from '../data/nations.js';
import { confirmDialog } from './ui/components.js';

// Vorerst deaktiviert (Wunsch Nutzer): nur DartConnect- oder Schnellsimulation. Parameter in throwModel.manualParams
// müssen bei Reaktivierung auf die Perzentil-Attribute neu kalibriert werden.
export const MANUAL_AVAILABLE = false;
const AI_DART_MS = 520, VISIT_PAUSE_MS = 900, LEG_PAUSE_MS = 1500;

// ---------- Scheibe (SVG, einmal erzeugt) ----------
const P = (r, a) => { const t = a * Math.PI / 180; return `${(Math.sin(t) * r).toFixed(2)} ${(-Math.cos(t) * r).toFixed(2)}`; };
const sector = (r1, r2, a0, a1) => `M${P(r2, a0)}A${r2} ${r2} 0 0 1 ${P(r2, a1)}L${P(r1, a1)}A${r1} ${r1} 0 0 0 ${P(r1, a0)}Z`;
const ring = (r1, r2) => `M0 ${-r2}A${r2} ${r2} 0 1 1 0 ${r2}A${r2} ${r2} 0 1 1 0 ${-r2}ZM0 ${-r1}A${r1} ${r1} 0 1 0 0 ${r1}A${r1} ${r1} 0 1 0 0 ${-r1}Z`;

let boardCache = '';
function boardSvg() {
  if (boardCache) return boardCache;
  let segs = '', nums = '';
  ORDER.forEach((n, i) => {
    const a0 = i * 18 - 9, a1 = i * 18 + 9, dark = i % 2 === 0;
    const single = dark ? '#16181d' : '#efe3c4', bed = dark ? '#d8283d' : '#169a52';
    segs += `<path d="${sector(R.outerBull, R.tripleIn, a0, a1)}" fill="${single}"/>`
      + `<path d="${sector(R.tripleIn, R.tripleOut, a0, a1)}" fill="${bed}"/>`
      + `<path d="${sector(R.tripleOut, R.doubleIn, a0, a1)}" fill="${single}"/>`
      + `<path d="${sector(R.doubleIn, R.doubleOut, a0, a1)}" fill="${bed}"/>`;
    const [x, y] = P(186, i * 18).split(' ');
    nums += `<text x="${x}" y="${y}" class="bd-num">${n}</text>`;
  });
  boardCache = `<circle r="200" fill="#0b0d12"/><circle r="${R.doubleOut + 2}" fill="#2a2d33"/>
    ${segs}<circle r="${R.outerBull}" fill="#169a52"/><circle r="${R.bull}" fill="#d8283d"/>
    <g class="bd-wire">${ORDER.map((_, i) => `<line x1="${P(R.outerBull, i * 18 - 9).split(' ')[0]}" y1="${P(R.outerBull, i * 18 - 9).split(' ')[1]}" x2="${P(R.doubleOut, i * 18 - 9).split(' ')[0]}" y2="${P(R.doubleOut, i * 18 - 9).split(' ')[1]}"/>`).join('')}
    ${[R.bull, R.outerBull, R.tripleIn, R.tripleOut, R.doubleIn, R.doubleOut].map(r => `<circle r="${r}"/>`).join('')}</g>
    ${nums}`;
  return boardCache;
}

// Umriss des Zielfeldes
function regionPath(label) {
  if (label === 'BULL') return ring(0.01, R.bull);
  if (label === '25') return ring(R.bull, R.outerBull);
  const a = segAngle(+label.slice(1)), k = label[0];
  const [r1, r2] = k === 'T' ? [R.tripleIn, R.tripleOut] : k === 'D' ? [R.doubleIn, R.doubleOut] : [R.tripleOut, R.doubleIn];
  return sector(r1, r2, a - 9, a + 9);
}

// ---------- Screen ----------
let ui = null; // Laufzeit-Zustand (nicht gespeichert)

export function render(app) {
  const s = app.state, inst = s.activeEvent;
  const pm = inst && playerMatch(inst);
  if (!pm || pm.winner) return '<div class="panel">Kein offenes Match.</div>';
  const round = inst.rounds[inst.current];
  return `<div class="match-screen">
    <header class="topbar">
      <button class="back-btn" data-go="event" aria-label="Zurück">◂</button>
      <div class="title"><h2>${esc(round.name)}</h2><div class="sub">${esc(inst.name)} · ${formatLabel(round.format)}</div></div>
      <button class="btn btn-sm btn-ghost" id="btn-rest">Rest simulieren</button>
    </header>
    <div id="scoreboard" class="scoreboard"></div>
    <div class="match-layout">
      <div class="board-wrap" id="stage">
        <svg id="board" viewBox="-200 -200 400 400" aria-label="Dartscheibe">
          ${boardSvg()}
          <path id="target-region" class="target-region" d=""/>
          <g id="marks"></g>
          <g id="cross" class="crosshair"><circle r="9"/><line x1="-15" x2="-5"/><line x1="5" x2="15"/><line y1="-15" y2="-5"/><line y1="5" y2="15"/></g>
          <line id="vline" class="aim-line v" x1="0" x2="0" y1="-200" y2="200"/>
          <line id="hline" class="aim-line h" x1="-200" x2="200" y1="0" y2="0"/>
        </svg>
        <div class="board-banner" id="banner"></div>
        <div class="pressure-tag hidden" id="pressure">Nerven!</div>
      </div>
      <div class="match-side">
        <div class="visit-slots" id="slots"></div>
        <div class="co-hint" id="co-hint"></div>
        <div class="target-chips" id="chips"></div>
        <button class="btn btn-primary btn-block btn-throw" id="btn-throw">Werfen</button>
        <div class="throw-help muted" id="help"></div>
      </div>
    </div>
  </div>`;
}

export function mount(root, app) {
  const s = app.state;
  const live = startManualMatch(s);
  app.save();
  const pm = playerMatch(s.activeEvent);
  const ids = [pm.a, pm.b];
  ui = {
    app, s, live, ids, me: live.me, rng: new RNG(s.rng),
    phase: 'idle', target: null, raf: 0, t0: 0, ph0: 0, fx: 0, fy: 0, prm: null, timers: [],
    el: {
      svg: root.querySelector('#board'), stage: root.querySelector('#stage'), v: root.querySelector('#vline'), h: root.querySelector('#hline'),
      cross: root.querySelector('#cross'), region: root.querySelector('#target-region'), marks: root.querySelector('#marks'),
      sb: root.querySelector('#scoreboard'), slots: root.querySelector('#slots'), hint: root.querySelector('#co-hint'),
      chips: root.querySelector('#chips'), btn: root.querySelector('#btn-throw'), help: root.querySelector('#help'),
      banner: root.querySelector('#banner'), pressure: root.querySelector('#pressure'),
    },
  };
  ui.el.stage.addEventListener('pointerdown', onStagePointer);
  ui.el.btn.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); onAction(); });
  ui.el.chips.addEventListener('click', e => { const b = e.target.closest('[data-t]'); if (b && ui.phase === 'aim') setTarget(b.dataset.t); });
  root.querySelector('#btn-rest').onclick = onSimRest;
  document.addEventListener('keydown', onKey);
  drawScoreboard();
  nextTurn();
}

export function unmount() {
  if (!ui) return;
  cancelAnimationFrame(ui.raf);
  ui.timers.forEach(clearTimeout);
  document.removeEventListener('keydown', onKey);
  ui = null;
}

const later = (fn, ms) => { const t = setTimeout(() => { if (ui) fn(); }, ms); ui.timers.push(t); };
const m = () => ui.live.m;
const attrsOf = i => getPlayer(ui.s, ui.ids[i]).attrs;

// ---------- Ablauf ----------
function nextTurn() {
  const mm = m();
  if (mm.done) return finish();
  if (mm.turn === ui.me) startAim();
  else aiTurn();
  drawScoreboard();
}

function startAim() {
  ui.phase = 'aim';
  hideLines();
  setTarget(suggestTarget(m().rem[ui.me], dartsLeft(m())));
  setButton('Werfen', false);
  ui.el.help.textContent = 'Ziel antippen oder Feld wählen · Werfen (Leertaste)';
}

function setTarget(label) {
  ui.target = label;
  const p = targetPoint(label);
  ui.el.cross.setAttribute('transform', `translate(${p.x} ${p.y})`);
  ui.el.cross.style.display = '';
  ui.el.region.setAttribute('d', regionPath(label));
  ui.prm = manualParams(attrsOf(ui.me), m(), ui.me, label);
  ui.el.pressure.classList.toggle('hidden', !ui.prm.pressure);
  drawChips();
}

function onAction() {
  if (ui.phase === 'aim') startLine('v');
  else if (ui.phase === 'v' || ui.phase === 'h') stopLine();
}

function onStagePointer(e) {
  if (ui.phase === 'v' || ui.phase === 'h') { e.preventDefault(); stopLine(); return; }
  if (ui.phase !== 'aim') return;
  const pt = ui.el.svg.createSVGPoint();
  pt.x = e.clientX; pt.y = e.clientY;
  const p = pt.matrixTransform(ui.el.svg.getScreenCTM().inverse());
  const h = scoreAt(p.x, p.y);
  if (h.label !== 'OUT') setTarget(h.label);
}

function onKey(e) {
  if (e.code !== 'Space' && e.code !== 'Enter') return;
  if (e.target.closest?.('.modal')) return;
  e.preventDefault();
  if (!e.repeat) onAction();
}

// Linie starten: Position wird aus der absoluten Zeit berechnet → frameunabhängig, ruckelfrei
function startLine(axis) {
  ui.phase = axis;
  ui.t0 = performance.now();
  ui.ph0 = ui.rng.next();                         // zufällige Startphase
  const line = axis === 'v' ? ui.el.v : ui.el.h;
  line.style.display = '';
  line.classList.remove('fixed');
  setButton('Stopp', false);
  ui.el.help.textContent = axis === 'v' ? 'Vertikale Linie stoppen (Tippen / Leertaste)' : 'Horizontale Linie stoppen';
  cancelAnimationFrame(ui.raf);
  const tick = now => {
    if (!ui || ui.phase !== axis) return;
    const pos = linePos(axis, now);
    if (axis === 'v') ui.el.v.setAttribute('transform', `translate(${pos} 0)`);
    else ui.el.h.setAttribute('transform', `translate(0 ${pos})`);
    ui.raf = requestAnimationFrame(tick);
  };
  ui.raf = requestAnimationFrame(tick);
}

function linePos(axis, now) {
  const p = targetPoint(ui.target), dt = (now - ui.t0) / 1000;
  const f = axis === 'v' ? ui.prm.freq : ui.prm.freq * 1.13;
  return (axis === 'v' ? p.x : p.y) + ui.prm.amp * wave(ui.ph0 + dt * f);
}

function stopLine() {
  const now = performance.now();
  cancelAnimationFrame(ui.raf);
  const pos = linePos(ui.phase, now);
  if (ui.phase === 'v') {
    ui.fx = pos;
    ui.el.v.setAttribute('transform', `translate(${pos} 0)`);
    ui.el.v.classList.add('fixed');
    startLine('h');
  } else {
    ui.fy = pos;
    ui.el.h.setAttribute('transform', `translate(0 ${pos})`);
    ui.el.h.classList.add('fixed');
    // Reststreuung (Konstanz)
    const x = ui.fx + ui.rng.normal(0, ui.prm.scatter), y = ui.fy + ui.rng.normal(0, ui.prm.scatter);
    ui.phase = 'busy';
    setButton('…', true);
    ui.el.help.textContent = '';
    land(x, y, scoreAt(x, y), true);
  }
}

// Dart landet (Spieler oder KI)
function land(x, y, hit, mine) {
  const ev = throwDart(m(), hit);
  addMark(x, y, mine);
  drawScoreboard(ev);
  if (mine) later(() => hideLines(), 350);
  if (ev.bust) banner('Bust!', 'bust');
  if (ev.matchEnd) { banner(`Match · ${getPlayer(ui.s, ui.ids[ev.player]).name}`, 'leg'); later(finish, LEG_PAUSE_MS); return; }
  if (ev.legEnd) {
    banner(`${ev.setEnd ? 'Satz' : 'Leg'} · ${getPlayer(ui.s, ui.ids[ev.player]).name}`, 'leg');
    ui.app.save();
    later(() => { clearMarks(); nextTurn(); }, LEG_PAUSE_MS);
    return;
  }
  if (ev.visitEnd) {
    ui.app.save();
    later(() => { clearMarks(); nextTurn(); }, VISIT_PAUSE_MS);
    return;
  }
  if (mine) later(startAim, 380);
}

function aiTurn() {
  ui.phase = 'ai';
  hideLines(); ui.el.cross.style.display = 'none'; ui.el.region.setAttribute('d', '');
  ui.el.pressure.classList.add('hidden');
  setButton('Gegner wirft …', true);
  ui.el.help.textContent = '';
  drawChips(true);
  const side = m().turn;
  const step = () => {
    if (!ui || m().turn !== side || m().done) return;
    const d = liveAiDart(ui.s, side);
    const before = m().visit.darts.length;
    land(d.x, d.y, d.hit, false);
    if (m().turn === side && !m().done && m().visit.darts.length > before) later(step, AI_DART_MS);
  };
  later(step, AI_DART_MS);
}

function finish() {
  const s = ui.s, app = ui.app;
  finishManualMatch(s);
  nextRound(s);
  app.save();
  app.go('event', { showResult: true });
}

async function onSimRest() {
  if (!await confirmDialog('Rest simulieren?', 'Das Match wird ab dem aktuellen Stand automatisch zu Ende gespielt.', 'Simulieren')) return;
  if (!ui) return;
  const s = ui.s, app = ui.app;
  cancelAnimationFrame(ui.raf);
  ui.timers.forEach(clearTimeout);
  simulateLiveRest(s);
  nextRound(s);
  app.save();
  app.go('event', { showResult: true });
}

// ---------- Darstellung ----------
function hideLines() { ui.el.v.style.display = 'none'; ui.el.h.style.display = 'none'; }
function setButton(txt, disabled) { ui.el.btn.textContent = txt; ui.el.btn.disabled = disabled; }

function addMark(x, y, mine) {
  const NS = 'http://www.w3.org/2000/svg';
  const g = document.createElementNS(NS, 'g');
  g.setAttribute('class', `dart-mark ${mine ? 'me' : 'opp'}`);
  g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
  g.innerHTML = '<circle r="5.5"/><circle r="1.8" class="core"/>';
  ui.el.marks.appendChild(g);
}
const clearMarks = () => { ui.el.marks.innerHTML = ''; };

function banner(text, cls) {
  const b = ui.el.banner;
  b.textContent = text; b.className = `board-banner show ${cls}`;
  later(() => { b.className = 'board-banner'; }, 1100);
}

function drawChips(off = false) {
  const mm = m(), rem = mm.rem[ui.me];
  const route = rem <= 170 ? checkoutRoute(rem, dartsLeft(mm)) : null;
  const base = ['T20', 'T19', 'T18', 'BULL', '25'];
  const list = [...new Set([...(route ?? []), ...base])].slice(0, 7);
  ui.el.chips.innerHTML = off ? '' : list.map(l =>
    `<button class="chip ${l === ui.target ? 'active' : ''}" data-t="${l}">${fieldName(l)}</button>`).join('');
  ui.el.hint.innerHTML = route && mm.turn === ui.me ? `<span class="label">Checkout</span> <b>${route.map(fieldName).join(' · ')}</b>` : '';
  const cur = mm.turn === ui.me ? mm.visit.darts : [];
  ui.el.slots.innerHTML = [0, 1, 2].map(i => `<span class="slot ${cur[i] ? 'filled' : ''}">${cur[i] ? fieldName(cur[i]) : ''}</span>`).join('');
}

function drawScoreboard(ev) {
  const mm = m(), sets = !!mm.format.sets;
  const row = i => {
    const p = getPlayer(ui.s, ui.ids[i]);
    const last = mm.last[i];
    const active = mm.turn === i && !mm.done;
    const curDarts = mm.turn === i ? mm.visit.darts.map(fieldName).join(' ') : '';
    return `<div class="sb-row ${active ? 'active' : ''} ${i === ui.me ? 'me' : ''}">
      <span class="sb-dot"></span>
      <span class="sb-name">${flag(p.nation)} ${esc(p.name)}</span>
      ${sets ? `<span class="sb-num" title="Sätze">${mm.sets[i]}</span>` : ''}
      <span class="sb-num" title="Legs">${mm.legs[i]}</span>
      <span class="sb-rem">${mm.rem[i]}</span>
      <span class="sb-info"><span>Ø ${fmtNum(liveAverage(mm, i), 1)}</span><span class="sb-last">${curDarts || (last ? (last.bust ? 'Bust' : last.score) : '–')}</span></span>
    </div>`;
  };
  ui.el.sb.innerHTML = `<div class="sb-head"><span></span><span></span>${sets ? '<span>S</span>' : ''}<span>L</span><span></span><span>${isDecider(mm) ? '<b class="gold">Entscheidung</b>' : ''}</span></div>${row(0)}${row(1)}`;
  ui.el.sb.classList.toggle('sets', sets);
  if (ui.phase !== 'ai') drawChips(mm.turn !== ui.me);
  else drawChips(true);
}
