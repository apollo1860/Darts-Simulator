// Spielstände: laden, löschen, neue Karriere
import { listSlots, loadGame, deleteSlot } from '../../../state.js';
import { esc } from '../../../util.js';
import { flag } from '../../../../data/nations.js';
import { frame, titleBand, bar, starIcon, coin, arrowIcon } from '../frame.js';
import { confirmDialog, toast } from '../../components.js';

export const nsd = true;
export function render() {
  const slots = listSlots();
  return frame({
    body: `${titleBand('Spielstand wählen')}
    <div class="nsd-rows">${slots.map(s => s.empty
      ? `<button class="nsd-btn row" data-new="${s.slot}"><span class="ic">➕</span><span class="lb">Slot ${s.slot} · Neue Karriere</span></button>`
      : `<div class="nsd-dark sm" style="text-align:left">
          <div style="font-size:1.35rem">${flag(s.nation)} ${esc(s.name)} ${s.ended ? '· Karriereende' : ''}</div>
          <div style="font-weight:600;opacity:.9">Slot ${s.slot} · ${s.year} · KW ${s.week} · ${starIcon(s.star, 'sm')} Status ${s.star} · ${coin(s.stars)}</div>
        </div>
        <div class="nsd-grid2"><button class="nsd-btn" data-load="${s.slot}"><span class="lb">Laden</span></button>
          <button class="nsd-btn" data-del="${s.slot}"><span class="lb" style="color:#ff6b6b">Löschen</span></button></div>`).join('')}
    </div>`,
    bottom: bar([{ go: 'title', icon: arrowIcon(true), label: 'Zurück' }]),
  });
}
export function mount(root, app) {
  root.querySelectorAll('[data-new]').forEach(b => b.onclick = () => app.go('welcome', { slot: +b.dataset.new }));
  root.querySelectorAll('[data-load]').forEach(b => b.onclick = () => {
    const s = loadGame(+b.dataset.load);
    if (!s) return toast('Spielstand defekt', 'error');
    app.state = s;
    app.go(s.ended ? 'careerEnd' : (s.activeEvent ? 'event' : 'hub'));
  });
  root.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
    if (await confirmDialog('Spielstand löschen?', `Slot ${b.dataset.del} wird unwiderruflich gelöscht.`, 'Löschen')) { deleteSlot(+b.dataset.del); app.refresh(); }
  });
}
