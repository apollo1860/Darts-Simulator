// Trainings-Minispiele: Scoring (Mindestpunktzahl), Finishing (Doppel treffen), Fokus (Memory 4×4), Rechnen (Finish antippen).
// Je 3 Versuche (Fokus: 3 Herzen). params: {key, level, mode: 'train'|'placement'|'practice'}
import { esc } from '../../../util.js';
import { RNG } from '../../../rng.js';
import { ORDER, scoreAt, targetPoint, fieldName, labelValue } from '../../../board.js';
import { wave, landInCircle, rampPhase, Y_SPEED } from '../../../throwModel.js';
import { TRAINABLE, skillEffective } from '../../../nsd.js';
import { ATTEMPTS, pointsFor, scoringMin, finishTarget, memoryPreview, memorySwaps, memorySwapMs, MEMORY_GAP, calcTime, calcTask, calcFirst, validFinish, trainAim, finishTraining } from '../../../skilltrain.js';
import { boardSvg, regionPath } from '../../boardSvg.js';
import { frame, titleBand, darkBar, bar, heartIcon, starIcon, arrowIcon } from '../frame.js';
import { getSettings, setSetting } from '../settings.js';
import { icon as nicon } from '../icons.js';

export const nsd = true;
let g = null;   // Laufzeit-Zustand

const TASK = {
  sco: L => `Wirf mit einer Aufnahme mindestens <b>${scoringMin(L)}</b> Punkte.`,
  fin: L => `Triff <b>${fieldName(finishTarget(L))}</b> – 3 Darts pro Versuch.`,
  foc: L => `„Los“ deckt alle Karten 3 s auf. Merken, dem Mischen (${memorySwaps(L)}×) folgen, <b>ein</b> Paar finden.`,
  cal: L => `Tippe ein gültiges Finish für die Zahl an – ${calcTime(L)} Sekunden Zeit.${calcFirst(L) ? ' Der <b>erste Dart steckt</b> bereits.' : ''}`,
};

export function render(app, params = {}) {
  const { key = 'sco', level = 1, mode = 'train' } = params, t = TRAINABLE.find(x => x.key === key);
  const head = mode === 'placement' ? `Einstufung · ${t.label}` : `${t.label} · Level ${level}`;
  return frame({
    cls: 'fixed',
    body: `${titleBand(head)}
      <div class="nsd-mg-task">${TASK[key](level)}</div>
      <div class="nsd-mg-tries" id="tries"></div>
      <div class="nsd-mg" id="mg"></div>
      <div class="nsd-mg-result hidden" id="res"></div>`,
    bottom: bar([{ id: 'mg-quit', icon: '✖', label: mode === 'practice' ? 'Ende' : 'Aufgeben' }, null,
      { id: 'mg-act', icon: arrowIcon(), label: 'Los', wide: true }]),
  });
}

export function mount(root, app, params = {}) {
  const { key = 'sco', level = 1, mode = 'train' } = params, s = app.state;
  const p = s?.player;
  g = { app, root, key, level, mode, step: params.step, attempt: 1, done: false, timers: [], raf: 0,
    rng: s && mode !== 'practice' ? new RNG(s.rng) : new RNG({ s: Date.now() % 2147483647 }),
    skill: k => (p && mode === 'train' ? skillEffective(p, k) : 0),
    el: id => root.querySelector(id) };
  root.querySelector('#mg-quit').onclick = () => end(0, true);
  document.addEventListener('keydown', onKey);
  ({ sco: aimGame, fin: aimGame, foc: memoryGame, cal: calcGame })[key]();
}
export function unmount() {
  if (!g) return;
  g.timers.forEach(clearTimeout); cancelAnimationFrame(g.raf); clearInterval(g.tick);
  document.removeEventListener('keydown', onKey);
  g = null;
}
const later = (fn, ms) => g.timers.push(setTimeout(() => g && fn(), ms));
function onKey(e) {
  if (!g || (e.code !== 'Space' && e.code !== 'Enter') || e.target.closest?.('.modal')) return;
  e.preventDefault(); if (!e.repeat) g.action?.();
}
function setAction(label, fn, disabled = false, throwy = false) {
  const b = g.el('#mg-act');
  b.querySelector('.lb').textContent = label; b.disabled = disabled;
  // Werfen/Stopp sieht aus wie im Spiel: grüner Knopf mit Zielscheibe (Version 89); sonst grauer Pfeil
  b.classList.toggle('nsd-throw', throwy);
  const ic = b.querySelector('.ic'); if (ic) { ic.innerHTML = throwy ? '🎯' : arrowIcon(); ic.style.color = throwy ? '#2bd33a' : ''; }
  g.action = disabled ? null : fn;
  b.onpointerdown = e => { e.preventDefault(); g.action?.(); };
}
function tries(hearts = false) {
  const left = ATTEMPTS - g.attempt + 1;
  g.el('#tries').innerHTML = hearts
    ? Array.from({ length: ATTEMPTS }, (_, i) => `<span class="${i < g.hearts ? '' : 'gone'}">${heartIcon()}</span>`).join('')
    : `Versuch <b>${Math.min(g.attempt, ATTEMPTS)}</b> von ${ATTEMPTS} · ${'●'.repeat(Math.max(0, left))}${'○'.repeat(ATTEMPTS - Math.max(0, left))}`;
}
// Versuch gescheitert → nächster oder Ende
function failAttempt(next) {
  g.attempt++;
  if (g.attempt > ATTEMPTS) return later(() => end(0), 900);
  tries(); later(next, 1100);
}

// ---- Ende: Ergebnis eintragen und anzeigen ----
function end(successAttempt, quit = false) {
  if (!g || g.done) return;
  g.done = true;
  g.timers.forEach(clearTimeout); cancelAnimationFrame(g.raf); clearInterval(g.tick);
  const { app, key, level, mode, step } = g, s = app.state, label = TRAINABLE.find(t => t.key === key).label;
  if (quit && mode === 'practice') return app.go('practice');
  let txt;
  const pts = pointsFor(successAttempt);
  if (mode === 'practice') txt = pts ? `Geschafft im ${successAttempt}. Versuch!` : 'Nicht geschafft.';
  else {
    const r = finishTraining(s, key, level, successAttempt, { placement: mode === 'placement' });
    app.save();
    txt = mode === 'placement'
      ? `${label}: ${pts ? `${pts} Punkt${pts > 1 ? 'e' : ''}` : 'kein Punkt'} – Startwert ${r.value}.`
      : pts ? `Geschafft im ${successAttempt}. Versuch! ${r.gain ? `${label} +${r.gain} → ${r.value}` : 'Kein neuer Rekord für dieses Level.'}`
        : 'Drei Fehlversuche – nur die Energie ist weg.';
  }
  const el = g.el('#res');
  el.classList.remove('hidden');
  el.innerHTML = `<div class="stars">${[1, 2, 3].map(i => `<span class="${i <= pts ? '' : 'off'}">${starIcon()}</span>`).join('')}</div><div>${esc(txt)}</div>`;
  setAction('Weiter', () => {
    if (mode === 'practice') return app.go('practice');
    if (mode === 'placement') return app.go('placement', { step: (step ?? 0) + 1 });
    app.go('trainlevels', { key });
  });
}

// ================= Scoring / Finishing: Linien + Kreis =================
function aimGame() {
  const { key, level } = g, fin = key === 'fin';
  g.target = fin ? finishTarget(level) : 'T20';
  g.prm = () => trainAim(g.skill(fin || g.target === 'BULL' || g.target[0] === 'D' ? 'fin' : 'sco'), g.skill('foc'), level);
  g.el('#mg').innerHTML = `<div class="nsd-aim-stage" id="stage"><svg id="bsvg" viewBox="-200 -200 400 400">${boardSvg()}
      <path class="target-region" id="region" d=""/><g id="cross" class="crosshair"><circle r="7"/></g>
      <circle id="circ" class="nsd-circ" r="0" style="display:none"/>
      <line id="vline" class="aim-line v" x1="0" x2="0" y1="-200" y2="200" style="display:none"/>
      <line id="hline" class="aim-line h" x1="-200" x2="200" y1="0" y2="0" style="display:none"/><g id="marks"></g></svg>
      <div class="board-banner" id="banner"></div><button class="nsd-zoomtog corner" id="ztog"></button></div>
    <div class="nsd-mg-info" id="info"></div>
    ${fin ? '' : '<div class="nsd-chips" id="chips"></div>'}`;
  // Zoom-Hilfe wie im Liveticker (gleiche Einstellung, wird gemerkt): Viertel der Scheibe um das Ziel
  g.el('#ztog').addEventListener('pointerdown', e => e.stopPropagation());   // liegt auf der Scheibe: kein Zielwechsel/Stopp durch den Knopf
  g.el('#ztog').addEventListener('click', e => { e.stopPropagation(); setSetting('zoom', !getSettings().zoom); zoomLabel(); zoomTo(g.target); });
  zoomLabel();
  g.el('#stage').addEventListener('pointerdown', e => {
    if (g.phase === 'v' || g.phase === 'h') { e.preventDefault(); return stopLine(); }
    if (fin || g.phase !== 'pick') return;
    const svg = g.el('#bsvg'), pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const q = pt.matrixTransform(svg.getScreenCTM().inverse()), h = scoreAt(q.x, q.y);
    if (h.label !== 'OUT') setTarget(h.label);
  });
  g.el('#chips')?.addEventListener('click', e => { const b = e.target.closest('[data-t]'); if (b && g.phase === 'pick') setTarget(b.dataset.t); });
  newVisit();
}
function newVisit() {
  g.darts = []; g.sum = 0;
  g.el('#marks').innerHTML = '';
  tries(); nextAimDart();
}
const zoomLabel = () => { const b = g.el('#ztog'); if (b) { const on = getSettings().zoom; b.textContent = `Zoom ${on ? 'an' : 'aus'}`; b.title = 'Zoom-Hilfe'; b.classList.toggle('on', on); } };
function zoomTo(label) {
  const svg = g.el('#bsvg');
  if (!svg) return;
  if (!getSettings().zoom || !label) return svg.setAttribute('viewBox', '-200 -200 400 400');
  const p = targetPoint(label), size = 200, h = size / 2;
  const cx = Math.max(-200 + h, Math.min(200 - h, p.x)), cy = Math.max(-200 + h, Math.min(200 - h, p.y));
  svg.setAttribute('viewBox', `${(cx - h).toFixed(1)} ${(cy - h).toFixed(1)} ${size} ${size}`);
}
function setTarget(label) {
  g.target = label;
  zoomTo(label);
  const p = targetPoint(label);
  g.el('#cross').setAttribute('transform', `translate(${p.x} ${p.y})`);
  g.el('#region').setAttribute('d', regionPath(label));
  const ch = g.el('#chips');
  if (ch) ch.innerHTML = ['T20', 'T19', 'T18', 'BULL'].map(t => `<button class="nsd-chip ${t === label ? 'on' : ''}" data-t="${t}">${fieldName(t)}</button>`).join('');
  info();
}
function info() {
  const fin = g.key === 'fin';
  const n = Math.min(3, g.darts.length + 1);
  g.el('#info').innerHTML = fin ? `Dart ${n} von 3 · Ziel <b>${fieldName(g.target)}</b>`
    : `Dart ${n} von 3 · Summe <b>${g.sum}</b> / ${scoringMin(g.level)}`;
}
function nextAimDart() {
  g.phase = 'pick';
  ['#vline', '#hline', '#circ'].forEach(id => { g.el(id).style.display = 'none'; g.el(id).classList.remove('fixed'); });
  g.el('#banner').className = 'board-banner';
  setTarget(g.target);
  setAction(`Werfen (Dart ${g.darts.length + 1})`, () => (g.phase === 'pick' ? startLine('v') : stopLine()), false, true);
}
function linePos(axis, now) {
  const p = targetPoint(g.target), dt = (now - g.t0) / 1000;
  return (axis === 'v' ? p.x : p.y) + g.cur.amp * wave(g.ph + rampPhase(dt, g.cur.freq * (axis === 'v' ? 1 : Y_SPEED)));   // wie im Spiel: y-Linie langsamer, bei jedem Richtungswechsel schneller
}
function startLine(axis) {
  if (axis === 'v') g.cur = g.prm();
  g.phase = axis; g.t0 = performance.now(); g.ph = g.rng.next();
  const p = targetPoint(g.target), line = g.el(axis === 'v' ? '#vline' : '#hline'), circ = g.el('#circ');
  line.style.display = ''; circ.style.display = ''; circ.setAttribute('r', g.cur.radius.toFixed(1));
  setAction('Stopp', stopLine, false, true);
  cancelAnimationFrame(g.raf);
  const tick = now => {
    if (!g || g.phase !== axis) return;
    const pos = linePos(axis, now);
    if (axis === 'v') { line.setAttribute('transform', `translate(${pos} 0)`); circ.setAttribute('cx', pos); circ.setAttribute('cy', p.y); }
    else { line.setAttribute('transform', `translate(0 ${pos})`); circ.setAttribute('cx', g.fx); circ.setAttribute('cy', pos); }
    g.raf = requestAnimationFrame(tick);
  };
  g.raf = requestAnimationFrame(tick);
}
function stopLine() {
  if (g.phase !== 'v' && g.phase !== 'h') return;
  const pos = linePos(g.phase, performance.now());
  cancelAnimationFrame(g.raf);
  if (g.phase === 'v') { g.fx = pos; g.el('#vline').setAttribute('transform', `translate(${pos} 0)`); g.el('#vline').classList.add('fixed'); return startLine('h'); }
  g.el('#hline').setAttribute('transform', `translate(0 ${pos})`); g.el('#hline').classList.add('fixed');
  g.phase = 'busy'; setAction('…', null, true, true);
  const pt = landInCircle(g.fx, pos, g.cur.radius, g.rng), hit = scoreAt(pt.x, pt.y);
  const NS = 'http://www.w3.org/2000/svg', m = document.createElementNS(NS, 'g');
  m.setAttribute('class', 'dart-mark me'); m.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
  m.innerHTML = '<circle r="6"/><circle r="2" class="core"/>';
  g.el('#marks').appendChild(m);
  g.darts.push(hit); g.sum += hit.score;
  const fin = g.key === 'fin', ok = fin ? hit.label === g.target : g.sum >= scoringMin(g.level);
  const bn = g.el('#banner');
  bn.textContent = fin ? (ok ? 'TREFFER!' : fieldName(hit.label)) : `${fieldName(hit.label)}${hit.mult > 1 ? ` (${hit.score})` : ''}`;
  bn.className = `board-banner show ${ok || (!fin && hit.score >= 40) ? 'leg' : 'bust'}`;
  info();
  if (ok && (fin || g.darts.length === 3 || g.sum >= scoringMin(g.level))) return later(() => end(g.attempt), 900);
  if (g.darts.length < 3) return later(nextAimDart, 750);
  bn.textContent = fin ? 'Daneben' : `${g.sum} – zu wenig`;
  bn.className = 'board-banner show bust';
  failAttempt(newVisit);
}

// ================= Fokus: Memory 4×4 =================
// Version 172: verdeckt starten, „Los“ → 3 s offen, umdrehen, dann kurz nacheinander vermischen (Tausche je Level). Ein gefundenes Paar = geschafft:
// ohne Fehler 3 Sterne, 1 Fehler 2, 2 Fehler 1, 3 Fehler (Herzen weg) = gescheitert.
// Acht klar unterscheidbare Darts-Symbole (Form + Farbe): Scheibe, Dart, Flight, Pokal, Bier, „180“, Mikrofon, Kreidetafel „501“
const ICONS = ['board', 'darts', 'flight', 'ranks', 'pint', 'one80', 'mic', 'chalk'];
const BACKS = ['red', 'blue', 'green', 'yellow'];
function memoryGame() {
  g.hearts = ATTEMPTS; g.open = [];
  g.cards = g.rng.shuffle([...ICONS, ...ICONS]).map((icon, i) => ({ icon, back: g.rng.pick(BACKS), up: false, done: false, pos: i }));
  drawMemory(); tries(true);
  setAction('Los', () => {
    setAction('Merken …', null, true);
    g.cards.forEach(c => { c.up = true; }); drawMemory();          // erst jetzt aufdecken
    let left = memoryPreview(g.level);
    const show = () => { g.el('#tries').innerHTML = `Merken: <b>${left.toFixed(1).replace('.', ',')} s</b>`; };
    show();
    g.tick = setInterval(() => {
      left = Math.max(0, left - 0.1); show();
      if (left > 0) return;
      clearInterval(g.tick);
      g.cards.forEach(c => { c.up = false; }); drawMemory(); tries(true);
      setAction('Mischen …', null, true);
      later(() => shuffleStep(memorySwaps(g.level)), 400);
    }, 100);
  });
  g.el('#mg').addEventListener('click', e => {
    const b = e.target.closest('[data-c]');
    if (!b || !g.play || g.open.length >= 2) return;
    const c = g.cards[+b.dataset.c];
    if (c.up || c.done) return;
    c.up = true; g.open.push(c); drawMemory();
    if (g.open.length < 2) return;
    const [a, d] = g.open;
    if (a.icon === d.icon) {                                    // Paar gefunden → geschafft
      a.done = d.done = true; g.play = false; drawMemory();
      return later(() => end(ATTEMPTS - g.hearts + 1), 700);
    }
    g.hearts--; tries(true);
    later(() => {
      a.up = d.up = false; g.open = []; drawMemory();
      if (g.hearts <= 0) { g.play = false; end(0); }
    }, 800);
  });
}
// Zwei verdeckte Karten tauschen ihre Plätze (sichtbar animiert)
function shuffleStep(n) {
  if (!g) return;
  if (n <= 0) { g.play = true; setAction('Ein Paar finden', null, true); return; }
  const i = g.rng.int(0, 15);
  let j = g.rng.int(0, 14); if (j >= i) j++;
  const a = g.cards.find(c => c.pos === i), b = g.cards.find(c => c.pos === j);
  a.pos = j; b.pos = i;
  placeCards(memorySwapMs(g.level));
  later(() => shuffleStep(n - 1), memorySwapMs(g.level) + MEMORY_GAP);
}
function drawMemory() {
  const el = g.el('#mg');
  if (!el.querySelector('.nsd-memo')) {
    el.innerHTML = `<div class="nsd-memo">${g.cards.map((c, i) => `<button class="nsd-memo-card" data-c="${i}"></button>`).join('')}</div>`;
  }
  el.querySelectorAll('[data-c]').forEach(b => {
    const c = g.cards[+b.dataset.c];
    b.className = `nsd-memo-card ${c.up || c.done ? 'up' : `back ${c.back}`} ${c.done ? 'done' : ''}`;
    b.innerHTML = c.up || c.done ? nicon(c.icon) : '';
  });
  placeCards(0);
}
function placeCards(ms) {
  g.el('#mg').querySelectorAll('[data-c]').forEach(b => {
    const c = g.cards[+b.dataset.c];
    b.style.transition = ms ? `left ${ms}ms ease-in-out, top ${ms}ms ease-in-out` : 'none';
    b.style.left = `${(c.pos % 4) * 25}%`; b.style.top = `${Math.floor(c.pos / 4) * 25}%`;
  });
}

// ================= Rechnen: Finish auf einer (vereinfachten) Scheibe antippen =================
// Schema-Scheibe mit gleich breiten Ringen (gut antippbar): Bull, 25, Single innen, Triple, Single außen, Doppel
const RR = [0, 22, 44, 92, 130, 160, 196];
function calcBoardSvg() {
  const P = (r, a) => { const t = a * Math.PI / 180; return `${(Math.sin(t) * r).toFixed(2)} ${(-Math.cos(t) * r).toFixed(2)}`; };
  const sec = (r1, r2, a0, a1) => `M${P(r2, a0)}A${r2} ${r2} 0 0 1 ${P(r2, a1)}L${P(r1, a1)}A${r1} ${r1} 0 0 0 ${P(r1, a0)}Z`;
  let s = '';
  ORDER.forEach((n, i) => {
    const a0 = i * 18 - 9, a1 = i * 18 + 9, dark = i % 2 === 0;
    const single = dark ? '#16181d' : '#efe3c4', bed = dark ? '#d8283d' : '#169a52', txt = dark ? '#efe3c4' : '#16181d';
    s += `<path d="${sec(RR[2], RR[3], a0, a1)}" fill="${single}"/><path d="${sec(RR[3], RR[4], a0, a1)}" fill="${bed}"/>`
      + `<path d="${sec(RR[4], RR[5], a0, a1)}" fill="${single}"/><path d="${sec(RR[5], RR[6], a0, a1)}" fill="${bed}"/>`;
    const [x, y] = P(145, i * 18).split(' ');
    s += `<text x="${x}" y="${y}" class="nsd-cb-num" fill="${txt}">${n}</text>`;
  });
  return `<circle r="200" fill="#0b0d12"/>${s}<circle r="${RR[2]}" fill="#169a52"/><circle r="${RR[1]}" fill="#d8283d"/>
    <text x="0" y="0" class="nsd-cb-num" fill="#fff">B</text><g id="cmarks"></g>`;
}
function calcHit(x, y) {
  const r = Math.hypot(x, y);
  if (r <= RR[1]) return 'BULL';
  if (r <= RR[2]) return '25';
  if (r > RR[6]) return null;
  const deg = (Math.atan2(x, -y) * 180 / Math.PI + 369) % 360, n = ORDER[Math.floor(deg / 18) % 20];
  return (r <= RR[3] ? 'S' : r <= RR[4] ? 'T' : r <= RR[5] ? 'S' : 'D') + n;
}
// Mitte eines Feldes auf der Schema-Scheibe (für den bereits steckenden ersten Dart), leicht versetzt
function calcPoint(l, rng) {
  if (l === 'BULL') return { x: rng.float(-6, 6), y: rng.float(-6, 6) };
  const n = l === '25' ? 0 : +l.slice(1), i = ORDER.indexOf(n), a = (i * 18 + rng.float(-5, 5)) * Math.PI / 180;
  const r = l === '25' ? 33 : l[0] === 'T' ? (RR[3] + RR[4]) / 2 : l[0] === 'D' ? (RR[5] + RR[6]) / 2 : (RR[2] + RR[3]) / 2 + rng.float(-8, 8);
  return { x: Math.sin(a) * r, y: -Math.cos(a) * r };
}
// Darts auf der Scheibe wie im Spiel (Markierungen)
function drawMarks() {
  g.el('#cmarks').innerHTML = g.pts.map(q => `<g class="dart-mark me" transform="translate(${q.x.toFixed(1)} ${q.y.toFixed(1)})"><circle r="9"/><circle r="3" class="core"/></g>`).join('');
}
function calcGame() {
  g.el('#mg').innerHTML = `<div class="nsd-calc-rem"><small>Rest</small><b id="crem"></b><div class="nsd-calc-time"><i id="ctime"></i></div></div>
    <div class="nsd-aim-stage" id="cstage"><svg id="csvg" viewBox="-200 -200 400 400">${calcBoardSvg()}</svg></div>
    <div class="nsd-calc-darts" id="cdarts"></div>`;
  g.el('#cstage').addEventListener('pointerdown', e => {
    if (!g.play) return;
    const svg = g.el('#csvg'), pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const q = pt.matrixTransform(svg.getScreenCTM().inverse()), l = calcHit(q.x, q.y);
    if (!l) return;
    g.picked.push(l); g.pts.push({ x: q.x, y: q.y }); drawPicked(); drawMarks();
    const sum = g.picked.reduce((a, x) => a + labelValue(x), 0);
    if (sum >= g.rem || g.picked.length === 3) checkCalc();
  });
  newCalc();
}
function newCalc() {
  const task = calcTask(g.rng, g.level);
  g.rem = task.rem; g.fixed = task.first ? 1 : 0; g.picked = task.first ? [task.first] : []; g.pts = task.first ? [calcPoint(task.first, g.rng)] : []; g.play = true;
  g.el('#crem').textContent = g.rem; drawPicked(); drawMarks(); tries();
  // Rückgängig: letzten eigenen Dart entfernen (der vorgegebene erste Dart bleibt stecken)
  setAction('Rückgängig', () => { if (!g.play || g.picked.length <= g.fixed) return; g.picked.pop(); g.pts.pop(); drawPicked(); drawMarks(); });
  const ic = g.el('#mg-act .ic'); if (ic) ic.innerHTML = arrowIcon(true);
  const t = calcTime(g.level), bar = g.el('#ctime');
  clearInterval(g.tick);
  if (t) {
    const t0 = performance.now();
    g.tick = setInterval(() => {
      const left = 1 - (performance.now() - t0) / (t * 1000);
      bar.style.width = `${Math.max(0, left) * 100}%`;
      if (left <= 0) { clearInterval(g.tick); calcFail('Zeit abgelaufen'); }
    }, 50);
  }
}
function drawPicked() {
  const sum = g.picked.reduce((a, x) => a + labelValue(x), 0);
  g.el('#cdarts').innerHTML = [0, 1, 2].map(i => `<span class="${g.picked[i] ? 'on' : ''}${i < g.fixed ? ' fix' : ''}">${g.picked[i] ? fieldName(g.picked[i]) : '–'}</span>`).join('')
    + `<b>= ${sum}</b>`;
}
function checkCalc() {
  clearInterval(g.tick); g.play = false;
  if (validFinish(g.picked, g.rem)) { g.el('#cdarts').classList.add('ok'); return later(() => end(g.attempt), 800); }
  calcFail('Kein gültiges Finish');
}
function calcFail(why) {
  if (!g.play && why === 'Zeit abgelaufen' && g.done) return;
  g.play = false;
  g.el('#cdarts').insertAdjacentHTML('beforeend', `<em>${why}</em>`);
  g.el('#cdarts').classList.add('bad');
  failAttempt(() => { g.el('#cdarts').classList.remove('bad'); newCalc(); });
}
