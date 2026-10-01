// Einstellungen / Speichern
import { exportGame, importGame, saveGame } from '../../state.js';
import { esc } from '../../util.js';
import { topbar, confirmDialog, toast } from '../components.js';

export function render(app) {
  const s = app.state;
  return `${topbar({ title: 'Speichern & Menü', sub: `Slot ${s.slot} · Auto-Save nach jeder Woche` })}
  <div class="stack" style="max-width:560px">
    <div class="panel stack">
      <h3>Spielstand</h3>
      <p class="muted" style="font-size:.86rem">Zuletzt gespeichert: ${s.savedAt ? new Date(s.savedAt).toLocaleString('de-DE') : '–'}</p>
      <button class="btn btn-primary btn-block" id="b-save">Jetzt speichern</button>
      <button class="btn btn-block" id="b-export">Als JSON exportieren</button>
      <button class="btn btn-ghost btn-block" id="b-import">JSON in Slot ${s.slot} importieren</button>
      <input type="file" id="f-import" accept="application/json,.json" class="hidden">
    </div>
    <div class="panel stack">
      <h3>Karriere</h3>
      <button class="btn btn-block" id="b-menu">Zum Hauptmenü</button>
      <button class="btn btn-danger btn-block" id="b-end">Karriere beenden</button>
      <p class="muted" style="font-size:.8rem">Beenden zeigt deine Abschlussbilanz. Danach kannst du neu starten.</p>
    </div>
    <p class="muted" style="font-size:.75rem">${esc(s.player.name)} · Seed ${s.seed}</p>
  </div>`;
}

export function mount(root, app) {
  const s = app.state;
  root.querySelector('#b-save').onclick = () => app.save(false);
  root.querySelector('#b-export').onclick = () => { app.save(); exportGame(s); };
  const f = root.querySelector('#f-import');
  root.querySelector('#b-import').onclick = async () => {
    if (await confirmDialog('Importieren?', 'Der aktuelle Spielstand in diesem Slot wird ersetzt.', 'Datei wählen')) f.click();
  };
  f.onchange = async () => {
    try {
      const ns = await importGame(f.files[0], s.slot);
      saveGame(ns); app.state = ns; toast('Importiert', 'success'); app.go('hub');
    } catch (e) { toast(e.message || 'Import fehlgeschlagen', 'error'); }
  };
  root.querySelector('#b-menu').onclick = () => { app.save(); app.state = null; app.go('menu'); };
  root.querySelector('#b-end').onclick = async () => {
    if (!await confirmDialog('Karriere beenden?', 'Die Karriere wird abgeschlossen und kann nicht fortgesetzt werden.', 'Beenden', 'btn-danger')) return;
    s.ended = true; s.activeEvent = null; app.save(); app.go('careerEnd');
  };
}
