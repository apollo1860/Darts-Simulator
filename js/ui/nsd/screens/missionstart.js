// Version 273: Mission starten – Hintergrundgeschichte, Ziel, eigener Name/Nation
// Version 278: auch als realer Spieler (Suche + Auswahl) und mit eigenem Einsteckwinkel
import { esc } from '../../../util.js';
import { NATIONS } from '../../../../data/nations.js';
import { realPlayers } from '../../../nsd.js';
import { ANGLE_MIN, ANGLE_MAX, ANGLE_DEFAULT } from '../../../obstruction.js';
import { dartSvg, effectText } from '../angle.js';
import { missionById, startMission, MISSION_SLOT } from '../../../missions.js';
import { loadGame, saveGame } from '../../../state.js';
import { frame, titleBand, darkBar, bar, arrowIcon } from '../frame.js';
import { toast, confirmDialog } from '../../components.js';

export const nsd = true;
const form = { mode: 'own', first: '', last: '', nation: 'DE', search: '', real: '', angle: ANGLE_DEFAULT };
let REAL = null;
const reals = () => (REAL ??= realPlayers());
const norm = t => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const matches = () => { const q = norm(form.search.trim()); return q ? reals().filter(r => norm(r.name).includes(q)) : reals(); };
const realOptions = list => list.length ? list.map(r => `<option value="${esc(r.name)}" ${r.name === form.real ? 'selected' : ''}>${esc(r.name)} (${r.nation})</option>`).join('')
  : '<option value="">Kein Spieler gefunden</option>';
export function render(app, params = {}) {
  const m = missionById(params.id);
  if (!m) return frame({ body: titleBand('Mission'), bottom: bar([{ go: 'missions', icon: arrowIcon(true), label: 'Zurück' }]) });
  return frame({
    body: `${titleBand(`<span style="font-size:.85em">${m.icon} ${esc(m.name)}</span>`)}
      <div class="nsd-card nsd-mis-story">${esc(m.story)}</div>
      ${darkBar('Ziel', 'sm')}
      <div class="nsd-card nsd-mis-goal">${esc(m.goal)}${m.cont ? '<br><small>Geschafft? Dann kannst du die Karriere normal weiterspielen.</small>' : ''}</div>
      ${darkBar('Dein Spieler', 'sm')}
      <div class="nsd-seg" id="ms-mode">${[['own', 'Eigener Spieler'], ['real', 'Realer Spieler']].map(([k, l]) =>
        `<button class="nsd-btn ${form.mode === k ? 'blue' : ''}" data-m="${k}"><span class="lb">${l}</span></button>`).join('')}</div>
      ${form.mode === 'real' ? `<input class="nsd-input" id="ms-search" maxlength="30" placeholder="Name suchen …" value="${esc(form.search)}" autocomplete="off">
      <div class="nsd-field arrow"><select class="nsd-select" id="ms-real">${realOptions(matches())}</select></div>
      <div class="nsd-angle-note">Name und Nation des Profis – Stärke und Ausgangslage gibt die Mission vor.</div>` : `<div class="nsd-grid2">
        <input class="nsd-input" id="ms-first" maxlength="16" placeholder="Vorname" value="${esc(form.first)}" autocomplete="off">
        <input class="nsd-input" id="ms-last" maxlength="18" placeholder="Nachname" value="${esc(form.last)}" autocomplete="off">
      </div>
      <div class="nsd-field arrow"><select class="nsd-select" id="ms-nation">${Object.entries(NATIONS).map(([c, n]) => `<option value="${c}" ${c === form.nation ? 'selected' : ''}>${n.name}</option>`).join('')}</select></div>`}
      ${darkBar('Einsteckwinkel', 'sm')}
      <div class="nsd-angle">
        <div class="nsd-angle-row"><input type="range" class="nsd-range" id="ms-angle" min="${ANGLE_MIN}" max="${ANGLE_MAX}" step="1" value="${form.angle}"><b id="ms-angle-v">${form.angle}°</b></div>
        <div id="ms-angle-svg">${dartSvg(form.angle)}</div>
        <div class="nsd-angle-note" id="ms-angle-fx">${effectText(form.angle)}</div>
      </div>`,
    bottom: bar([{ go: 'missions', icon: arrowIcon(true), label: 'Zurück' }, null, { id: 'ms-go', icon: arrowIcon(), label: 'Starten', wide: true }]),
  });
}
export function mount(root, app, params = {}) {
  const m = missionById(params.id); if (!m) return;
  const on = (sel, ev, fn) => { const el = root.querySelector(sel); if (el) el[ev] = fn; };
  on('#ms-first', 'oninput', e => { form.first = e.target.value; });
  on('#ms-last', 'oninput', e => { form.last = e.target.value; });
  on('#ms-nation', 'onchange', e => { form.nation = e.target.value; });
  on('#ms-mode', 'onclick', e => { const b = e.target.closest('[data-m]'); if (b && b.dataset.m !== form.mode) { form.mode = b.dataset.m; app.refresh(); } });
  const sel = root.querySelector('#ms-real');
  if (sel) {
    if (!form.real || !matches().some(r => r.name === form.real)) form.real = sel.value;
    sel.onchange = () => { form.real = sel.value; };
    on('#ms-search', 'oninput', e => {                       // filtert ohne Neuaufbau (Tastatur bleibt offen)
      form.search = e.target.value; const list = matches();
      if (!list.some(r => r.name === form.real)) form.real = list[0]?.name ?? '';
      sel.innerHTML = realOptions(list);
    });
  }
  on('#ms-angle', 'oninput', e => {
    form.angle = +e.target.value;
    root.querySelector('#ms-angle-v').textContent = `${form.angle}°`;
    root.querySelector('#ms-angle-svg').innerHTML = dartSvg(form.angle);
    root.querySelector('#ms-angle-fx').innerHTML = effectText(form.angle);
  });
  root.querySelector('#ms-go').onclick = async () => {
    const real = form.mode === 'real';
    if (real && !reals().some(r => r.name === form.real)) return toast('Bitte einen Spieler auswählen', 'error');
    if (!real && (form.first.trim().length < 2 || form.last.trim().length < 2)) return toast('Bitte Vor- und Nachnamen eingeben', 'error');
    const run = loadGame(MISSION_SLOT);
    if (run?.mission?.status === 'active' && !await confirmDialog('Laufende Mission abbrechen?', `„${esc(missionById(run.mission.id)?.name ?? '')}“ wird überschrieben.`, 'Neu starten')) return;
    const btn = root.querySelector('#ms-go'); btn.disabled = true; btn.querySelector('.lb').textContent = 'Lädt …';
    setTimeout(() => {                                       // UI kurz zeichnen lassen – manche Missionen simulieren vorab eine Saison
      try {
        app.state = startMission(m.id, { ...form, real: real ? form.real : null }); saveGame(app.state);
        app.go(app.state.activeEvent ? 'event' : 'hub');
      } catch (e) { console.error(e); toast(`Mission konnte nicht starten: ${e.message}`, 'error'); btn.disabled = false; btn.querySelector('.lb').textContent = 'Starten'; }
    }, 60);
  };
}
