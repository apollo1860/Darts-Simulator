// Version 273: Missionen (Titelmenü) – Liste mit Ziel und Status, laufende Mission fortsetzen, freies Training
import { esc } from '../../../util.js';
import { MISSIONS, MISSION_SLOT, missionById } from '../../../missions.js';
import { loadGame, missionsDone } from '../../../state.js';
import { frame, titleBand, darkBar, bar, arrowIcon, checkIcon } from '../frame.js';
import { toast } from '../../components.js';
import { icon as nicon } from '../icons.js';

export const nsd = true;
export function render() {
  const done = missionsDone(), run = loadGame(MISSION_SLOT), cur = run?.mission && run.mission.status === 'active' ? missionById(run.mission.id) : null;
  return frame({
    cls: 'fixed',
    body: `${titleBand('Missionen')}
      <div class="nsd-scroll nsd-missions">
        ${cur ? `<button class="nsd-btn row nsd-mis-cont" id="m-cont"><span class="ic">${cur.icon}</span><span class="lb"><span class="t">Fortsetzen</span><small>${esc(cur.name)} · ${esc(run.player.name)}</small></span></button>` : ''}
        ${MISSIONS.map(m => `<button class="nsd-mis" data-m="${m.id}">
          <span class="ic">${m.icon}</span>
          <span class="tx"><b>${esc(m.name)}</b><small>${esc(m.kind)}-Mission · ${esc(m.goal)}</small></span>
          <span class="ok">${done[m.id] ? checkIcon() : ''}</span>
        </button>`).join('')}
        ${darkBar('Ohne Mission', 'sm')}
        <button class="nsd-btn row" data-go="practice"><span class="ic">${nicon('skill')}</span><span class="lb">Freies Training</span></button>
      </div>`,
    bottom: bar([{ go: 'title', icon: arrowIcon(true), label: 'Zurück' }]),
  });
}
export function mount(root, app) {
  root.querySelectorAll('[data-m]').forEach(b => b.onclick = () => app.go('missionstart', { id: b.dataset.m }));
  root.querySelector('#m-cont')?.addEventListener('click', () => {
    const s = loadGame(MISSION_SLOT);
    if (!s) return toast('Spielstand defekt', 'error');
    app.state = s; app.go(s.activeEvent ? 'event' : 'hub');
  });
}
