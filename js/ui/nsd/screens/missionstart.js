// Version 273: Mission starten – Hintergrundgeschichte, Ziel, eigener Name/Nation
import { esc } from '../../../util.js';
import { NATIONS } from '../../../../data/nations.js';
import { missionById, startMission, MISSION_SLOT } from '../../../missions.js';
import { loadGame, saveGame } from '../../../state.js';
import { frame, titleBand, darkBar, bar, arrowIcon } from '../frame.js';
import { toast, confirmDialog } from '../../components.js';

export const nsd = true;
const form = { first: '', last: '', nation: 'DE' };
export function render(app, params = {}) {
  const m = missionById(params.id);
  if (!m) return frame({ body: titleBand('Mission'), bottom: bar([{ go: 'missions', icon: arrowIcon(true), label: 'Zurück' }]) });
  return frame({
    body: `${titleBand(`<span style="font-size:.85em">${m.icon} ${esc(m.name)}</span>`)}
      <div class="nsd-card nsd-mis-story">${esc(m.story)}</div>
      ${darkBar('Ziel', 'sm')}
      <div class="nsd-card nsd-mis-goal">${esc(m.goal)}${m.cont ? '<br><small>Geschafft? Dann kannst du die Karriere normal weiterspielen.</small>' : ''}</div>
      ${darkBar('Dein Spieler', 'sm')}
      <div class="nsd-grid2">
        <input class="nsd-input" id="ms-first" maxlength="16" placeholder="Vorname" value="${esc(form.first)}" autocomplete="off">
        <input class="nsd-input" id="ms-last" maxlength="18" placeholder="Nachname" value="${esc(form.last)}" autocomplete="off">
      </div>
      <div class="nsd-field arrow"><select class="nsd-select" id="ms-nation">${Object.entries(NATIONS).map(([c, n]) => `<option value="${c}" ${c === form.nation ? 'selected' : ''}>${n.name}</option>`).join('')}</select></div>`,
    bottom: bar([{ go: 'missions', icon: arrowIcon(true), label: 'Zurück' }, null, { id: 'ms-go', icon: arrowIcon(), label: 'Starten', wide: true }]),
  });
}
export function mount(root, app, params = {}) {
  const m = missionById(params.id); if (!m) return;
  root.querySelector('#ms-first').oninput = e => { form.first = e.target.value; };
  root.querySelector('#ms-last').oninput = e => { form.last = e.target.value; };
  root.querySelector('#ms-nation').onchange = e => { form.nation = e.target.value; };
  root.querySelector('#ms-go').onclick = async () => {
    if (form.first.trim().length < 2 || form.last.trim().length < 2) return toast('Bitte Vor- und Nachnamen eingeben', 'error');
    const run = loadGame(MISSION_SLOT);
    if (run?.mission?.status === 'active' && !await confirmDialog('Laufende Mission abbrechen?', `„${esc(missionById(run.mission.id)?.name ?? '')}“ wird überschrieben.`, 'Neu starten')) return;
    const btn = root.querySelector('#ms-go'); btn.disabled = true; btn.querySelector('.lb').textContent = 'Lädt …';
    setTimeout(() => {                                       // UI kurz zeichnen lassen – manche Missionen simulieren vorab eine Saison
      try {
        app.state = startMission(m.id, form); saveGame(app.state);
        app.go(app.state.activeEvent ? 'event' : 'hub');
      } catch (e) { console.error(e); toast(`Mission konnte nicht starten: ${e.message}`, 'error'); btn.disabled = false; btn.querySelector('.lb').textContent = 'Starten'; }
    }, 60);
  };
}
