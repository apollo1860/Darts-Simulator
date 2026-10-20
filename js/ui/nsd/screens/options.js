// Optionen: Spielstände exportieren / importieren
import { listSlots, loadGame, exportGame, importGame, saveGame } from '../../../state.js';
import { esc } from '../../../util.js';
import { frame, titleBand, bar, darkBar } from '../frame.js';
import { toast } from '../../components.js';

export const nsd = true;
export function render(app) {
  const slots = listSlots();
  return frame({
    body: `${titleBand('Optionen')}
    <div class="nsd-rows">
      ${darkBar('Spielstand exportieren')}
      <div class="nsd-grid3">${slots.map(s => `<button class="nsd-btn" data-exp="${s.slot}" ${s.empty ? 'disabled' : ''}><span class="lb">Slot ${s.slot}</span>
        <span style="font-size:.8rem;font-weight:600">${s.empty ? 'leer' : esc(s.name)}</span></button>`).join('')}</div>
      ${darkBar('Spielstand importieren')}
      <div class="nsd-grid3">${slots.map(s => `<button class="nsd-btn" data-imp="${s.slot}"><span class="lb">Slot ${s.slot}</span>
        <span style="font-size:.8rem;font-weight:600">${s.empty ? 'leer' : 'überschreiben'}</span></button>`).join('')}</div>
      ${app?.state ? `${darkBar('Aktueller Spielstand')}<button class="nsd-btn" data-go="editor"><span class="ic">🛠️</span><span class="lb">Editor</span></button>` : ''}
      <input type="file" id="o-file" accept="application/json,.json" hidden>
    </div>`,
    bottom: bar([{ go: 'title', icon: '<span style="color:#2bd33a">⬅</span>', label: 'Zurück' }]),
  });
}
export function mount(root, app) {
  const file = root.querySelector('#o-file');
  root.querySelectorAll('[data-exp]').forEach(b => b.onclick = () => { const s = loadGame(+b.dataset.exp); if (s) exportGame(s); });
  root.querySelectorAll('[data-imp]').forEach(b => b.onclick = () => { file.dataset.slot = b.dataset.imp; file.click(); });
  file.onchange = async () => {
    const f = file.files[0]; if (!f) return;
    try { const s = await importGame(f, +file.dataset.slot); saveGame(s); toast('Importiert', 'success'); app.refresh(); }
    catch (e) { toast(e.message || 'Import fehlgeschlagen', 'error'); }
  };
}
