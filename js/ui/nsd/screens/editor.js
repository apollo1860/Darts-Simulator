// Editor: Spielstand künstlich anpassen (Geld, Star-Status, Fähigkeiten, Energie, Zufriedenheit, Beziehungen, Alter, Tourcard)
import { EDIT_FIELDS, applyEdits } from '../../../nsd.js';
import { frame, header, titleBand, bar, bindHead } from '../frame.js';
import { toast } from '../../components.js';

export const nsd = true;
const HELP = '<p>Werte ändern und mit ✔ übernehmen. Fähigkeiten werden der Reihe nach mit Sternen gefüllt (3 je Level). Änderungen werden sofort gespeichert.</p>';
export function render(app) {
  const s = app.state;
  return frame({
    body: `${header(s.player.name)}${titleBand('Editor')}
      <div class="nsd-edit">${EDIT_FIELDS.map(f => `<label class="nsd-edit-row"><span>${f.label}</span>
        <input type="number" data-k="${f.key}" min="${f.min}" max="${f.max}" step="1" value="${Math.round(f.get(s) * 10) / 10}"></label>`).join('')}</div>`,
    bottom: bar([{ go: 'hub', icon: '✖', label: 'Abbrechen' }, null, { id: 'e-ok', icon: '<span class="nsd-check">✔</span>', label: 'Übernehmen', wide: true }]),
  });
}
export function mount(root, app) {
  bindHead(root, app, HELP);
  root.querySelector('#e-ok').onclick = () => {
    const vals = {};
    root.querySelectorAll('[data-k]').forEach(i => { if (i.value !== '') vals[i.dataset.k] = i.value; });
    applyEdits(app.state, vals); app.save(); toast('Übernommen', 'success'); app.go('hub');
  };
}
