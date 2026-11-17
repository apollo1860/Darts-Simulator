// Spielerprofil erstellen: eigener Spieler (Vorname, Nachname, Nation, Alter, Wurfhand) oder realer Spieler (Version 98: Suche + Auswahlliste)
import { NATIONS, flag } from '../../../../data/nations.js';
import { START_AGES } from '../../../player.js';
import { newNsdCareer, newRealCareer, realPlayers, realStartFor } from '../../../nsd.js';
import { ANGLE_MIN, ANGLE_MAX, ANGLE_DEFAULT, severity, stability } from '../../../obstruction.js';
import { saveGame, listSlots } from '../../../state.js';
import { randomSeed } from '../../../rng.js';
import { esc } from '../../../util.js';
import { frame, titleBand, darkBar, bar, arrowIcon, checkIcon } from '../frame.js';
import { toast, confirmDialog } from '../../components.js';

export const nsd = true;
const form = { mode: 'own', first: '', last: '', nation: 'DE', age: 18, hand: 'R', angle: ANGLE_DEFAULT, search: '', real: '', realAge: 25 };
let REAL = null;
const reals = () => (REAL ??= realPlayers());
const norm = t => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const matches = () => { const q = norm(form.search.trim()); return q ? reals().filter(r => norm(r.name).includes(q)) : reals(); };
const realOptions = list => list.length ? list.map(r => `<option value="${esc(r.name)}" ${r.name === form.real ? 'selected' : ''}>${esc(r.name)} (${r.nation}${r.age ? `, ${r.age}` : ''})</option>`).join('')
  : '<option value="">Kein Spieler gefunden</option>';
const ageList = () => Array.from({ length: START_AGES[1] - START_AGES[0] + 1 }, (_, i) => START_AGES[0] + i);
// Infokarte zum gewählten realen Spieler: Nation, Alter, Tour, geschätzte Start-Fähigkeiten
function realInfo() {
  const r = reals().find(x => x.name === form.real);
  if (!r) return '<div class="nsd-angle-note">Spieler suchen und auswählen.</div>';
  const sk = realStartFor(r), row = (l, v) => `<div class="nsd-result-row"><span>${l}</span><b>${v}</b></div>`;
  return `<div class="nsd-result">${row('Nation', `${flag(r.nation)} ${esc(NATIONS[r.nation]?.name ?? r.nation)}`)}${r.age ? row('Alter', `${r.age} Jahre`) : `<div class="nsd-result-row"><span>Alter (frei wählbar)</span><select class="nsd-select" id="p-rage" style="width:auto;height:40px;font-size:1.15rem;padding:0 14px">${ageList().map(a => `<option value="${a}" ${a === form.realAge ? 'selected' : ''}>${a} Jahre</option>`).join('')}</select></div>`}${row('Bisher', r.card ? 'Tourcard-Holder' : esc(r.group))}${row('Start', r.card ? 'mit seiner Tourcard' : 'neue Tourcard 2026/27')}
    ${row('Scoring · Finishing', `${sk.sco} · ${sk.fin}`)}${row('Fokus · Rechnen', `${sk.foc} · ${sk.cal}`)}${row('Star-Status (Mental)', sk.men)}</div>`;
}

// Seitenansicht: Board links, Dart steckt im roten Feld; positiver Winkel = hinteres Ende (Flight) oben
const dartSvg = a => `<svg class="nsd-angle-svg" viewBox="0 0 260 150" aria-hidden="true">
  <rect x="38" y="8" width="12" height="134" rx="3" fill="#aab5c6"/><rect x="38" y="68" width="12" height="26" fill="#c9444f"/>
  <line x1="56" y1="81" x2="236" y2="81" stroke="#8d9bb3" stroke-width="1.5" stroke-dasharray="6 6"/>
  <g transform="translate(50 81) rotate(${-a})"><line x1="0" y1="0" x2="118" y2="0" stroke="#dfe6ef" stroke-width="4" stroke-linecap="round"/>
    <rect x="28" y="-6" width="52" height="12" rx="6" fill="#b99f5e"/><polygon points="116,0 142,-18 164,-16 168,4 146,18" fill="#6fb59a" stroke="#fff" stroke-width="1.5"/></g></svg>`;
const effectText = a => {
  const sev = severity(a), shadow = sev < 0.2 ? 'kaum' : sev < 0.5 ? 'wenig' : sev < 0.8 ? 'deutlich' : 'stark';
  const flight = stability(a) > 1.0001 * stability(10) ? 'unruhigerer Flug' : 'ruhiger Flug';
  return `Verbaute Felder: <b>${shadow}</b> · ${flight}`;
};

export function render() {
  const ages = Array.from({ length: START_AGES[1] - START_AGES[0] + 1 }, (_, i) => START_AGES[0] + i);
  return frame({
    body: `${titleBand('Spielerprofil erstellen')}
    <div class="nsd-rows">
      <div class="nsd-seg" id="p-mode">${[['own', 'Eigener Spieler'], ['real', 'Realer Spieler']].map(([m, l]) =>
        `<button class="nsd-btn ${form.mode === m ? 'blue' : ''}" data-m="${m}"><span class="lb">${l}</span></button>`).join('')}</div>
      ${form.mode === 'real' ? `${darkBar('Spieler suchen')}<input class="nsd-input" id="p-search" maxlength="30" placeholder="Name eingeben …" value="${esc(form.search)}" autocomplete="off">
      <div class="nsd-field arrow"><select class="nsd-select" id="p-real">${realOptions(matches())}</select></div>
      <div id="p-info">${realInfo()}</div>
      <div class="nsd-stack">${darkBar('Wurfhand', 'sm')}
        <div class="nsd-seg" id="p-hand">${[['R', 'Rechts'], ['L', 'Links']].map(([h, l]) =>
          `<button class="nsd-btn ${form.hand === h ? 'blue' : ''}" data-h="${h}"><span class="lb">${l}</span></button>`).join('')}</div></div>` : `
      ${darkBar('Vorname')}<input class="nsd-input" id="p-first" maxlength="16" value="${esc(form.first)}" autocomplete="off">
      ${darkBar('Nachname')}<input class="nsd-input" id="p-last" maxlength="18" value="${esc(form.last)}" autocomplete="off">
      ${darkBar('Nation')}
      <div class="nsd-field arrow"><select class="nsd-select" id="p-nation">${Object.entries(NATIONS).map(([c, n]) =>
        `<option value="${c}" ${c === form.nation ? 'selected' : ''}>${n.name}</option>`).join('')}</select></div>
      <div class="nsd-grid2">
        <div class="nsd-stack">${darkBar('Alter', 'sm')}
          <div class="nsd-field"><select class="nsd-select" id="p-age" style="font-size:1.3rem;height:48px">${ages.map(a =>
            `<option value="${a}" ${a === form.age ? 'selected' : ''}>${a} Jahre</option>`).join('')}</select></div></div>
        <div class="nsd-stack">${darkBar('Wurfhand', 'sm')}
          <div class="nsd-seg" id="p-hand">${[['R', 'Rechts'], ['L', 'Links']].map(([h, l]) =>
            `<button class="nsd-btn ${form.hand === h ? 'blue' : ''}" data-h="${h}"><span class="lb">${l}</span></button>`).join('')}</div></div>
      </div>`}
      ${darkBar('Einschlagwinkel der Darts')}
      <div class="nsd-angle">
        <div class="nsd-angle-row"><input type="range" class="nsd-range" id="p-angle" min="${ANGLE_MIN}" max="${ANGLE_MAX}" step="1" value="${form.angle}"><b id="p-angle-v">${form.angle}°</b></div>
        <div class="nsd-angle-note">0°: waagerecht. Negative Werte senken das hintere Ende, positive heben es.</div>
        <div id="p-angle-svg">${dartSvg(form.angle)}</div>
        <div class="nsd-angle-note" id="p-angle-fx">${effectText(form.angle)}</div>
        <div class="nsd-angle-note">Steckende Darts verbauen mit dem Flight das Feld darüber – je steiler, desto stärker. Wer ein verbautes Feld stur weiter anspielt, streut mehr und riskiert Bouncer. Nach unten steckende Darts lassen sich leichter „drauflegen“, fliegen aber unruhiger.</div>
      </div>
    </div>`,
    bottom: bar([{ go: 'slots', icon: arrowIcon(true), label: 'Zurück' }, null, { id: 'p-ok', icon: checkIcon(), wide: true }]),
  });
}

export function mount(root, app, params) {
  const on = (sel, ev, fn) => { const el = root.querySelector(sel); if (el) el[ev] = fn; };
  root.querySelector('#p-mode').onclick = e => { const b = e.target.closest('[data-m]'); if (b && b.dataset.m !== form.mode) { form.mode = b.dataset.m; app.refresh(); } };
  on('#p-first', 'oninput', e => { form.first = e.target.value; });
  on('#p-last', 'oninput', e => { form.last = e.target.value; });
  on('#p-nation', 'onchange', e => { form.nation = e.target.value; });
  on('#p-age', 'onchange', e => { form.age = +e.target.value; });
  // Realer Spieler: Eingabefeld filtert die Auswahlliste (ohne Neuaufbau, damit die Tastatur offen bleibt)
  const sel = root.querySelector('#p-real'), info = root.querySelector('#p-info');
  const pick = () => { form.real = sel.value; info.innerHTML = realInfo(); };
  if (sel) {
    if (!form.real || !matches().some(r => r.name === form.real)) pick();
    sel.onchange = pick;
    info.onchange = e => { if (e.target.id === 'p-rage') form.realAge = +e.target.value; };   // Version 161: Alter für reale Spieler ohne bekanntes Alter
    root.querySelector('#p-search').oninput = e => {
      form.search = e.target.value;
      const list = matches();
      if (!list.some(r => r.name === form.real)) form.real = list[0]?.name ?? '';
      sel.innerHTML = realOptions(list); info.innerHTML = realInfo();
    };
  }
  root.querySelector('#p-angle').oninput = e => {
    form.angle = +e.target.value;
    root.querySelector('#p-angle-v').textContent = `${form.angle}°`;
    root.querySelector('#p-angle-svg').innerHTML = dartSvg(form.angle);
    root.querySelector('#p-angle-fx').innerHTML = effectText(form.angle);
  };
  root.querySelector('#p-hand').onclick = e => { const b = e.target.closest('[data-h]'); if (b) { form.hand = b.dataset.h; app.refresh(); } };
  root.querySelector('#p-ok').onclick = async () => {
    const first = form.first.trim(), last = form.last.trim(), real = form.mode === 'real';
    if (real && !reals().some(r => r.name === form.real)) return toast('Bitte einen Spieler auswählen', 'error');
    if (!real && (first.length < 2 || last.length < 2)) return toast('Bitte Vor- und Nachnamen eingeben', 'error');
    const slot = params.slot ?? 1;
    if (!listSlots().find(s => s.slot === slot).empty && !await confirmDialog('Slot überschreiben?', `In Slot ${slot} liegt bereits ein Spielstand.`, 'Überschreiben')) return;
    app.state = real ? newRealCareer({ name: form.real, hand: form.hand, angle: form.angle, slot, seed: randomSeed(), age: form.realAge })
      : newNsdCareer({ first, last, nation: form.nation, age: form.age, hand: form.hand, angle: form.angle, slot, seed: randomSeed() });
    saveGame(app.state);
    form.first = ''; form.last = '';
    app.go('intro');
  };
}
