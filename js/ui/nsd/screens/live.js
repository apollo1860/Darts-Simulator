// DartConnect-Liveticker (Tour-Modus): Aufnahme für Aufnahme, Schlüsselmomente wirfst du selbst.
// Zielmechanik: Ziel wählen → vertikale Linie stoppen → horizontale Linie stoppen → Dart landet zufällig im Kreis
// am Schnittpunkt (Kreis kleiner, je besser die Fähigkeiten). Gegner-Matchdarts werden auf der Scheibe gezeigt.
import { esc, fmtNum, surname } from '../../../util.js';
import { getSettings, setSetting } from '../settings.js';
import { getPlayer } from '../../../world.js';
import { legAverage, liveAverage, dartsLeft } from '../../../matchState.js';
import { formatLabel, formatLines } from '../../../matchEngine.js';
import { playerMatch, startManualMatch, finishManualMatch, simulateLiveRest, nextRound, liveDartStep, boardCall,
  keyMoment, aimParams, liveHumanDart, liveThrower } from '../../../tournaments.js';
import { scoreAt, targetPoint, suggestTarget, checkoutRoute, fieldName } from '../../../board.js';
import { wave, landInCircle, miscalcTarget } from '../../../throwModel.js';
import { RNG } from '../../../rng.js';
import { canSelfPlay, skillEffective } from '../../../nsd.js';
import { boardSvg, regionPath } from '../../boardSvg.js';
import { confirmDialog } from '../../components.js';
import { frame, bar, bindHead, checkIcon } from '../frame.js';

export const nsd = true;
const VISIT_MS = 1300, DART_MS = 1000;
const BOGEY = new Set([169, 168, 166, 165, 163, 162, 159]);
const KIND = { match: '🎯 MATCHDARTS', decider: '⚔️ ENTSCHEIDUNGSLEG', break: '💥 BREAK-CHANCE', finish: '🎯 CHECK-CHANCE', scoring: '💪 SCORING-AUFNAHME' };
const Y_SPEED = 0.8;   // Linie von oben nach unten etwas langsamer als die seitliche
const HELP = '<p>Bei Schlüsselmomenten wirfst du selbst: Ziel antippen (oder Vorschlag nehmen), dann mit dem grünen Knopf unten zweimal stoppen. Die Zoom-Hilfe beim Checken schaltest du am Board mit „🔍 Zoom“ an oder aus. Der Dart landet irgendwo im Kreis – je besser deine Fähigkeiten, desto kleiner der Kreis. Druck (Matchdarts, Entscheidungsleg) vergrößert ihn.</p>';
let ui = null;

export function render(app) {
  const inst = app.state.activeEvent, pm = inst && playerMatch(inst);
  if (!pm || pm.winner) return frame({ body: '<div class="nsd-card">Kein offenes Match.</div>', bottom: bar([null, null, { go: 'event', icon: checkIcon(), wide: true }]) });
  const round = inst.rounds[inst.current];
  return frame({
    cls: 'fixed', bg: 'grey',
    body: `<div class="nsd-livehead"><button class="nsd-sq red" data-nsd="menu" aria-label="Menü">✖</button>
        <div><b>${esc(inst.name)}</b><small>${esc(round.name)} · ${formatLabel(round.format)}</small></div>
        <button class="nsd-sq green" data-nsd="help" aria-label="Hilfe">?</button></div>
      <div class="nsd-live">
        <div class="dc" id="dc"></div>
        <div class="nsd-ticker" id="ticker"></div>
        <div class="nsd-aim hidden" id="aim"></div>
      </div>`,
    bottom: bar([{ id: 'l-pause', icon: '⏸', label: 'Pause' }, { id: 'l-fast', icon: '⏩', label: 'Tempo' },
      { id: 'l-end', icon: '⏭', label: 'Sofort beenden', wide: true }]),
  });
}

export function mount(root, app) {
  bindHead(root, app, HELP);
  const s = app.state;
  const live = startManualMatch(s);
  if (!live) return;
  app.save();
  const pm = playerMatch(s.activeEvent);
  ui = { app, s, live, me: live.me, ids: [pm.a, pm.b], timer: 0, raf: 0, paused: false, fast: false, lines: [],
    el: root.querySelector('#dc'), ticker: root.querySelector('#ticker'), aimEl: root.querySelector('#aim'), aim: null, show: null };
  ui.barEl = root.querySelector('.nsd-bar');
  ui.barHtml = ui.barEl.innerHTML;
  ui.ce = Math.max(0, 0.15 - 0.0025 * skillEffective(s.player, 'cal'));   // Rechenfehler beim Zielvorschlag
  bindBar();
  document.addEventListener('keydown', onKey);
  if (!canSelfPlay(s.player)) say('😵 Nicht match-fit – die KI wirft für dich.', 'bad');
  draw();
  schedule(700);
}

// Untere Leiste: normal Pause/Tempo/Sofort beenden – beim Selbstwerfen nur der große Wurf-Knopf
function bindBar() {
  const q = id => ui.barEl.querySelector(id);
  q('#l-pause').onclick = e => {
    ui.paused = !ui.paused;
    e.currentTarget.querySelector('.lb').textContent = ui.paused ? 'Weiter' : 'Pause';
    if (!ui.paused && !ui.aim) schedule(300);
  };
  q('#l-fast').onclick = e => { ui.fast = !ui.fast; e.currentTarget.classList.toggle('on', ui.fast); };
  q('#l-fast').classList.toggle('on', ui.fast);
  q('#l-end').onclick = async () => {
    if (ui?.aim) return;
    if (!await confirmDialog('Sofort beenden?', 'Der Rest des Matches wird ohne Anzeige simuliert – ohne deine Schlüsselmomente.', 'Beenden')) return;
    if (!ui) return;
    const { s: st, app: ap } = ui;
    stopAll(); simulateLiveRest(st); nextRound(st); ap.save(); ap.go('matchstats');
  };
}
function throwBar() {
  ui.barEl.innerHTML = '<span class="nsd-gap"></span><button class="nsd-btn wide nsd-throw" id="throw"><span class="ic" style="color:#2bd33a">🎯</span><span class="lb">Werfen</span></button><span class="nsd-gap"></span>';
  ui.barEl.querySelector('#throw').addEventListener('pointerdown', e => { e.preventDefault(); onAction(); });
}
function normalBar() { ui.barEl.innerHTML = ui.barHtml; bindBar(); }
const $t = () => ui.barEl.querySelector('#throw');

export function unmount() { if (!ui) return; stopAll(); document.removeEventListener('keydown', onKey); ui = null; }
function stopAll() { clearTimeout(ui.timer); cancelAnimationFrame(ui.raf); }
const wait = ms => (ui.fast ? ms / 3 : ms);
function schedule(ms) { clearTimeout(ui.timer); ui.timer = setTimeout(step, wait(ms)); }
// Doppel (World Cup): Name des Spielers, der gerade für das Team wirft
const nm = i => surname((ui.s.activeEvent?.teams?.[ui.ids[i]] ? getPlayer(ui.s, liveThrower(ui.s, i))?.name : getPlayer(ui.s, ui.ids[i])?.name) ?? '?');

// ---------- Ablauf ----------
function step() {
  if (!ui || ui.paused || ui.aim || ui.show) return;
  const m = ui.live.m;
  if (m.done) return finish();
  ui.starter = m.legStarter; ui.visitStart = m.visit.start;   // für Break-/Finish-Kommentar
  ui.thrower = liveThrower(ui.s, m.turn);                      // Doppel: wer wirft diese Aufnahme
  const key = keyMoment(ui.s);
  if (key) return startAim(key);
  if (m.turn !== ui.me && boardCall(ui.s) === 'match') return startShow('match');
  const side = m.turn;
  let r;
  do r = liveDartStep(ui.s); while (!r.visitOver);
  afterVisit(r.ev, side);
}

function afterVisit(ev, side) {
  ui.app.save();
  comment(ev, side);
  draw(ev);
  if (ui.live.m.done) { ui.timer = setTimeout(() => ui && finish(), wait(VISIT_MS * 1.5)); return; }
  schedule(ev?.legEnd ? VISIT_MS * 1.6 : VISIT_MS);
}

// Kommentarzeile
function comment(ev, side) {
  if (!ev) return;
  const mine = side === ui.me, who = mine && ui.thrower === 'P' ? 'Du' : surname(getPlayer(ui.s, ui.thrower)?.name ?? nm(side));
  if (ev.legEnd) {
    const brk = ui.starter !== side, big = ev.checkout && ui.visitStart >= 100 ? ` mit ${ui.visitStart}er-Finish` : '';
    say(`${ev.matchEnd ? '🏁 Match' : ev.setEnd ? '🏅 Satz' : '✅ Leg'} an ${who}${big}${brk ? ' – BREAK!' : ''}`, mine ? 'good' : 'bad');
  } else if (ev.visitScore === 180) say(`🔥 ${who}: ONE HUNDRED AND EIGHTY!`, mine ? 'good' : 'bad');
  else if (ev.bust) say(`💥 ${who}: überworfen`, mine ? 'bad' : 'good');
  else if (ev.visitScore >= 140) say(`${who}: ${ev.visitScore}`, '');
}
function say(text, tone) {
  ui.lines.unshift({ text, tone });
  ui.lines.length = Math.min(ui.lines.length, 3);
  ui.ticker.innerHTML = ui.lines.map((l, i) => `<div class="${l.tone} ${i ? 'old' : ''}">${esc(l.text)}</div>`).join('');
}

function finish() {
  const { s, app } = ui;
  stopAll(); finishManualMatch(s); nextRound(s); app.save();
  app.go('matchstats');
}

// ---------- Scheibe (Overlay) ----------
function boardHtml(head, extra = '') {
  return `<div class="nsd-aim-head">${head}</div>
    <div class="nsd-aim-stage" id="stage"><svg id="bsvg" viewBox="-200 -200 400 400" aria-label="Dartscheibe">${boardSvg()}
      <path class="target-region" id="region" d=""/>
      <g id="cross" class="crosshair" style="display:none"><circle r="7"/></g>
      <circle id="circ" class="nsd-circ" r="0" style="display:none"/>
      <line id="vline" class="aim-line v" x1="0" x2="0" y1="-200" y2="200" style="display:none"/>
      <line id="hline" class="aim-line h" x1="-200" x2="200" y1="0" y2="0" style="display:none"/>
      <g id="marks"></g></svg>
      <div class="board-banner" id="banner"></div></div>${extra}`;
}
const $ = id => ui.aimEl.querySelector(id);
function mark(x, y, mine) {
  const NS = 'http://www.w3.org/2000/svg', g = document.createElementNS(NS, 'g');
  g.setAttribute('class', `dart-mark ${mine ? 'me' : 'opp'}`);
  g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
  g.innerHTML = '<circle r="6"/><circle r="2" class="core"/>';
  $('#marks').appendChild(g);
}
function banner(text, good) { const b = $('#banner'); b.textContent = text; b.className = `board-banner show ${good ? 'leg' : 'bust'}`; }
function closeOverlay() {
  const wasAim = !!ui.aim;
  ui.aimEl.classList.add('hidden'); ui.aimEl.classList.remove('opp'); ui.aimEl.innerHTML = ''; ui.aim = null; ui.show = null;
  if (wasAim) normalBar();
}
const zoomLabel = () => { const b = $('#ztog'); if (b) { const on = getSettings().zoom; b.textContent = `🔍 Zoom ${on ? 'an' : 'aus'}`; b.classList.toggle('on', on); } };
// Zoom-Hilfe (Knopf am Board, wird gemerkt): nur das Viertel der Scheibe um das Ziel zeigen, sonst die ganze Scheibe
function zoomTo(label) {
  const svg = $('#bsvg');
  if (!svg) return;
  if (!getSettings().zoom || !ui.aim || !label) return svg.setAttribute('viewBox', '-200 -200 400 400');
  const p = targetPoint(label), size = 200, h = size / 2;
  const cx = Math.max(-200 + h, Math.min(200 - h, p.x)), cy = Math.max(-200 + h, Math.min(200 - h, p.y));
  svg.setAttribute('viewBox', `${(cx - h).toFixed(1)} ${(cy - h).toFixed(1)} ${size} ${size}`);
}

// Gegner-Matchdarts / 180 im Anflug: Dart für Dart zeigen
function startShow(kind, pre = []) {
  const m = ui.live.m, side = m.turn;
  ui.show = { kind, side, start: m.visit?.start ?? m.rem[side], sum: 0 };
  ui.aimEl.classList.remove('hidden'); ui.aimEl.classList.add('opp');
  ui.aimEl.innerHTML = boardHtml(`🔴 GEGNER WIRFT · MATCHDARTS · ${esc(nm(side))} steht auf <b>${ui.show.start}</b>`);
  for (const d of pre) { ui.show.sum += d.hit.score; mark(d.x, d.y, false); }
  ui.timer = setTimeout(showDart, wait(pre.length ? 1100 : 800));
}
function showDart() {
  if (!ui || ui.paused) { if (ui) ui.timer = setTimeout(showDart, 400); return; }
  const r = liveDartStep(ui.s), sh = ui.show;
  sh.sum += r.dart.hit.score;
  $('#region').setAttribute('d', r.dart.target === 'OUT' ? '' : regionPath(r.dart.target));
  mark(r.dart.x, r.dart.y, false);
  ui.app.save(); draw(r.visitOver ? r.ev : null);
  if (!r.visitOver) { ui.timer = setTimeout(showDart, wait(DART_MS)); return; }
  const ok = r.ev?.checkout || (sh.kind === '180' && sh.sum === 180 && !r.ev?.bust);
  banner(r.ev?.checkout ? 'Matchdart verwandelt' : sh.kind === '180' ? (ok ? 'ONE HUNDRED AND EIGHTY!' : `Knapp – ${sh.sum}`) : 'Überstanden!', !ok);
  ui.timer = setTimeout(() => { if (!ui) return; closeOverlay(); afterVisit(r.ev, sh.side); }, wait(ok ? 1800 : 1400));
}

// ---------- Selbst werfen ----------
function startAim(kind) {
  const m = ui.live.m;
  ui.aim = { kind, phase: 'pick', target: null, prm: null, fx: 0, fy: 0, t0: 0, ph: 0, rng: new RNG(ui.s.rng) };
  ui.aimEl.classList.remove('hidden');
  ui.aimEl.innerHTML = boardHtml(`🟢 DU WIRFST · ${KIND[kind]} · Rest <b id="rem">${m.rem[ui.me]}</b>`,
    `<div class="nsd-aim-opp">Gegner ${esc(nm(1 - ui.me))} steht auf <b>${m.rem[1 - ui.me]}</b> · Legs ${m.legs[ui.me]}:${m.legs[1 - ui.me]}
       <button class="nsd-zoomtog" id="ztog"></button></div>
     <div class="nsd-aim-info" id="info"></div><div class="nsd-chips" id="chips"></div>`);
  throwBar();
  $('#stage').addEventListener('pointerdown', onStage);
  $('#chips').addEventListener('click', e => { const b = e.target.closest('[data-t]'); if (b && ui.aim?.phase === 'pick') setTarget(b.dataset.t); });
  // Zoom-Hilfe jederzeit an/aus (wird gemerkt)
  $('#ztog').addEventListener('click', e => { e.stopPropagation(); setSetting('zoom', !getSettings().zoom); zoomLabel(); if (ui.aim?.target) zoomTo(ui.aim.target); });
  zoomLabel();
  nextDart();
}
function nextDart() {
  const m = ui.live.m, a = ui.aim;
  a.phase = 'pick';
  $('#rem').textContent = m.rem[ui.me];
  ['#vline', '#hline', '#circ'].forEach(id => { $(id).style.display = 'none'; $(id).classList.remove('fixed'); });
  const sug = suggestTarget(m.rem[ui.me], dartsLeft(m), a.rng.next());
  setTarget(miscalcTarget(sug, m.rem[ui.me], ui.ce, a.rng));         // schwaches Rechnen: Vorschlag manchmal falsch
  $t().querySelector('.lb').textContent = `Werfen (Dart ${m.visit.darts.length + 1})`;
  $t().disabled = false;
}
function setTarget(label) {
  const a = ui.aim, m = ui.live.m, p = targetPoint(label);
  a.target = label; a.prm = aimParams(ui.s, label);
  $('#cross').style.display = ''; $('#cross').setAttribute('transform', `translate(${p.x} ${p.y})`);
  $('#region').setAttribute('d', regionPath(label));
  zoomTo(label);
  const route = ui.ce < 0.12 ? checkoutRoute(m.rem[ui.me], dartsLeft(m)) : null;   // Weg nur bei ordentlichem Rechnen
  $('#info').innerHTML = `Ziel <b>${fieldName(label)}</b>${route ? ` · Weg ${route.map(fieldName).join(' – ')}` : ''}${a.prm.pressure ? ' · <span class="neg">Druck!</span>' : ''}`;
  const chips = [...new Set([suggestTarget(m.rem[ui.me], dartsLeft(m)), ...(route ?? []), 'T20', 'T19', 'BULL'])].slice(0, 5);
  $('#chips').innerHTML = chips.map(t => `<button class="nsd-chip ${t === label ? 'on' : ''}" data-t="${t}">${fieldName(t)}</button>`).join('');
}
function onKey(e) {
  if (!ui?.aim || (e.code !== 'Space' && e.code !== 'Enter') || e.target.closest?.('.modal')) return;
  e.preventDefault(); if (!e.repeat) onAction();
}
function onStage(e) {
  const a = ui?.aim;
  if (!a) return;
  if (a.phase === 'v' || a.phase === 'h') { e.preventDefault(); return stopLine(); }
  if (a.phase !== 'pick') return;
  const svg = $('#bsvg'), pt = svg.createSVGPoint();
  pt.x = e.clientX; pt.y = e.clientY;
  const q = pt.matrixTransform(svg.getScreenCTM().inverse()), h = scoreAt(q.x, q.y);
  if (h.label !== 'OUT') setTarget(h.label);
}
function onAction() {
  const a = ui?.aim;
  if (!a || ui.paused) return;
  if (a.phase === 'pick') startLine('v');
  else if (a.phase === 'v' || a.phase === 'h') stopLine();
}
function linePos(axis, now) {
  const a = ui.aim, p = targetPoint(a.target), dt = (now - a.t0) / 1000;
  return (axis === 'v' ? p.x : p.y) + a.prm.amp * wave(a.ph + dt * a.prm.freq * (axis === 'v' ? 1 : Y_SPEED));
}
function startLine(axis) {
  const a = ui.aim, p = targetPoint(a.target);
  a.phase = axis; a.t0 = performance.now(); a.ph = a.rng.next();
  const line = $(axis === 'v' ? '#vline' : '#hline'), circ = $('#circ');
  line.style.display = ''; circ.style.display = ''; circ.setAttribute('r', a.prm.radius.toFixed(1));
  $t().querySelector('.lb').textContent = 'Stopp';
  cancelAnimationFrame(ui.raf);
  const tick = now => {
    if (!ui?.aim || ui.aim.phase !== axis) return;
    const pos = linePos(axis, now);
    if (axis === 'v') { line.setAttribute('transform', `translate(${pos} 0)`); circ.setAttribute('cx', pos); circ.setAttribute('cy', p.y); }
    else { line.setAttribute('transform', `translate(0 ${pos})`); circ.setAttribute('cx', a.fx); circ.setAttribute('cy', pos); }
    ui.raf = requestAnimationFrame(tick);
  };
  ui.raf = requestAnimationFrame(tick);
}
function stopLine() {
  const a = ui.aim, pos = linePos(a.phase, performance.now());
  cancelAnimationFrame(ui.raf);
  if (a.phase === 'v') {
    a.fx = pos; $('#vline').setAttribute('transform', `translate(${pos} 0)`); $('#vline').classList.add('fixed');
    return startLine('h');
  }
  a.fy = pos; $('#hline').setAttribute('transform', `translate(0 ${pos})`); $('#hline').classList.add('fixed');
  $('#circ').setAttribute('cy', pos);
  a.phase = 'busy'; $t().disabled = true;
  const pt = landInCircle(a.fx, a.fy, a.prm.radius, a.rng);
  const r = liveHumanDart(ui.s, pt.x, pt.y, a.target);
  mark(pt.x, pt.y, true);
  ui.app.save(); draw(r.visitOver ? r.ev : null);
  if (r.visitOver) ui.app.flushMilestones?.();
  const h = r.dart.hit, txt = r.ev?.checkout ? (r.ev.matchEnd ? 'MATCH!' : 'CHECK!') : r.ev?.bust ? 'Überworfen!' : `${fieldName(h.label)}${h.mult > 1 ? ` (${h.score})` : ''}`;
  banner(txt, !r.ev?.bust);
  if (!r.visitOver) { ui.timer = setTimeout(() => { if (ui?.aim) { $('#banner').className = 'board-banner'; nextDart(); } }, 700); return; }
  ui.timer = setTimeout(() => { if (!ui) return; closeOverlay(); afterVisit(r.ev, ui.me); }, r.ev?.checkout ? 1600 : 1200);
}

// ---------- DartConnect-Tafel ----------
function draw(ev) {
  const m = ui.live.m, me = ui.me, op = 1 - me;
  const visits = m.legVisits ?? [[], []], active = m.done ? -1 : m.turn;
  const head = (i, side) => `<div class="dc-player ${side} ${active === i ? 'active' : ''}">
      <div class="dc-name">${m.legStarter === i ? '<i class="dc-dot"></i>' : ''}<span class="dc-nm">${esc(i === me && !ui.s.activeEvent?.teams ? surname(ui.s.player.name) : nm(i))}</span></div>
      <div class="dc-scorebox">${side === 'right' ? '' : avgs(i)}<span class="dc-rem">${m.rem[i]}</span>${side === 'right' ? avgs(i) : ''}</div></div>`;
  const avgs = i => `<div class="dc-avgs"><span class="dc-legavg">${fmtNum(legAverage(m, i), 0)}</span><span class="dc-avg">${fmtNum(liveAverage(m, i), 0)}</span></div>`;
  const nextRow = active >= 0 ? visits[active].length : -1, rows = Math.max(visits[0].length, visits[1].length, nextRow + 1, 1);
  const cell = (i, r, side) => {
    const v = visits[i][r], arrow = active === i && r === nextRow ? `<i class="dc-arrow ${side}"></i>` : '';
    if (!v) return `<div class="dc-cell ${side}">${arrow}</div>`;
    const cls = v.checkout ? 'co' : v.bust ? 'bust' : v.score >= 100 ? 'ton' : '';
    const bogey = !v.checkout && !v.bust && BOGEY.has(v.rem) ? '<small class="dc-bogey">⚠</small>' : '';
    const isNew = ev?.visitEnd && ev.player === i && r === visits[i].length - 1 ? 'new' : '';
    return `<div class="dc-cell ${side} ${cls} ${isNew}">${v.bust ? '0' : v.score}${v.checkout ? '<small>✓</small>' : ''}${bogey}</div>`;
  };
  let body = '';
  for (let r = 0; r < rows; r++) body += `<div class="dc-row">${cell(me, r, 'left')}<div class="dc-no">${r + 1}</div>${cell(op, r, 'right')}</div>`;
  const e = Math.round(ui.s.player.energy ?? 100);
  ui.el.innerHTML = `<div class="dc-top">${head(me, 'left')}
      <div class="dc-mid"><div class="dc-badge"><small>Legs</small>${m.legs[me]}:${m.legs[op]}</div>
        ${m.format.sets ? `<div class="dc-sets">Sätze ${m.sets[me]}:${m.sets[op]}</div>` : ''}<div class="dc-fmt">${formatLines(m.format).join('<br>')}</div><div class="dc-legno">⚡ ${e} %</div></div>
      ${head(op, 'right')}</div>
    <div class="dc-list" id="dc-list">${body}</div>`;
  const list = ui.el.querySelector('#dc-list');
  list.scrollTop = list.scrollHeight;
}
