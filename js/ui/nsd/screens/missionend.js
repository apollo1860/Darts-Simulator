// Version 273: Missionsende – geschafft/gescheitert; Karriere-Missionen nach Erfolg als normale Karriere weiterspielen
import { esc } from '../../../util.js';
import { missionById, MISSION_SLOT } from '../../../missions.js';
import { listSlots, saveGame, deleteSlot, markMissionDone } from '../../../state.js';
import { frame, titleBand, darkBar, bar, arrowIcon, checkIcon } from '../frame.js';
import { modal, confirmDialog, toast } from '../../components.js';

export const nsd = true;
export function render(app) {
  const s = app.state, mi = s?.mission, m = mi && missionById(mi.id), won = mi?.status === 'won';
  if (!m) return frame({ body: titleBand('Mission'), bottom: bar([{ go: 'missions', icon: arrowIcon(true), label: 'Missionen' }]) });
  return frame({
    bg: won ? 'green' : undefined,
    body: `${titleBand(`<span style="font-size:.85em">${m.icon} ${esc(m.name)}</span>`)}
      ${darkBar(won ? '🏆 MISSION ERFÜLLT!' : 'Mission gescheitert', won ? '' : 'red')}
      <div class="nsd-card nsd-mis-goal">${esc(m.goal)}</div>
      <div class="nsd-card nsd-mis-story">${won ? (m.cont ? 'Stark gemacht! Du kannst diese Karriere jetzt ganz normal weiterspielen – ohne Missionsziel.' : 'Stark gemacht – davon wird man noch lange erzählen.') : 'Diesmal hat es nicht gereicht. Versuch es gleich noch einmal!'}</div>`,
    bottom: bar([{ id: 'me-list', icon: arrowIcon(true), label: 'Missionen' }, null,
      won && m.cont ? { id: 'me-cont', icon: checkIcon(), label: 'Weiterspielen', wide: true } : { id: 'me-again', icon: arrowIcon(), label: 'Nochmal', wide: true }]),
  });
}
export function mount(root, app) {
  const s = app.state, mi = s?.mission; if (!mi) return;
  mi.seen = true;
  if (mi.status === 'won') markMissionDone(mi.id);
  saveGame(s);
  root.querySelector('#me-list').onclick = () => { if (!(mi.status === 'won' && missionById(mi.id)?.cont)) deleteSlot(MISSION_SLOT); app.state = null; app.go('missions'); };
  root.querySelector('#me-again')?.addEventListener('click', () => { deleteSlot(MISSION_SLOT); const id = mi.id; app.state = null; app.go('missionstart', { id }); });
  root.querySelector('#me-cont')?.addEventListener('click', () => {
    const slots = listSlots();
    modal({ title: 'Als Karriere weiterspielen', body: '<p>In welchem Spielstand soll die Karriere weiterlaufen?</p>',
      actions: [...slots.map(x => ({ label: `Slot ${x.slot}${x.empty ? ' · frei' : ` · ${esc(x.name)}`}`, cls: x.empty ? 'btn-primary' : '', onClick: async () => {
        if (!x.empty && !await confirmDialog('Slot überschreiben?', `In Slot ${x.slot} liegt bereits ein Spielstand.`, 'Überschreiben')) return;
        Object.assign(s, { slot: x.slot }); s.mission = { ...mi, free: true };
        if (!saveGame(s)) return toast('Speichern fehlgeschlagen', 'error');
        deleteSlot(MISSION_SLOT); app.go('hub');
      } })), { label: 'Abbrechen', cls: 'btn-ghost' }] });
  });
}
