// Hauptmenü
import { listSlots, loadGame, deleteSlot, importGame, saveGame } from '../../state.js';
import { esc, fmtEUR } from '../../util.js';
import { flag } from '../../../data/nations.js';
import { confirmDialog, modal, toast } from '../components.js';

export function render() {
  const slots = listSlots();
  const latest = slots.filter(s => !s.empty && !s.ended).sort((a, b) => b.savedAt - a.savedAt)[0];
  return `
  <div class="menu-hero">
    <h1>Darts<br><span class="accent">Career</span></h1>
    <div class="tagline">Karrieremodus · 501 · Double Out</div>
  </div>
  <div class="menu-actions">
    ${latest ? `<button class="btn btn-primary btn-block btn-continue" data-load="${latest.slot}">Fortsetzen · ${esc(latest.name)}</button>` : ''}
    <button class="btn ${latest ? '' : 'btn-primary'} btn-block" data-go="create">Neue Karriere</button>
    <button class="btn btn-ghost btn-block" id="btn-import">Spielstand importieren</button>
    <input type="file" id="file-import" accept="application/json,.json" class="hidden">
  </div>
  <div class="section-title"><span class="label">Spielstände</span></div>
  <div class="stack">
    ${slots.map(s => `<div class="panel slot">
      <div class="slot-n">${s.slot}</div>
      ${s.empty ? '<div class="grow muted">Leerer Slot</div>' : `
        <div class="grow">
          <div style="font-weight:700">${flag(s.nation)} ${esc(s.name)} ${s.ended ? '<span class="tag tag-qschool">Beendet</span>' : ''}</div>
          <div class="muted" style="font-size:.82rem">${s.year} · KW ${s.week} · ${fmtEUR(s.balance)}</div>
        </div>
        <button class="btn btn-sm" data-load="${s.slot}">Laden</button>
        <button class="btn btn-sm btn-ghost" data-del="${s.slot}" aria-label="Löschen">✕</button>`}
    </div>`).join('')}
  </div>
  <p class="muted center" style="font-size:.75rem;margin-top:28px">Fanprojekt · nur private Nutzung · echte Spielernamen ohne Lizenz</p>`;
}

export function mount(root, app) {
  root.querySelectorAll('[data-load]').forEach(b => b.onclick = () => {
    const s = loadGame(+b.dataset.load);
    if (!s) return toast('Spielstand defekt', 'error');
    app.state = s;
    app.go(s.ended ? 'careerEnd' : (s.activeEvent ? 'event' : 'hub'));
  });
  root.querySelectorAll('[data-del]').forEach(b => b.onclick = async () => {
    if (await confirmDialog('Spielstand löschen?', `Slot ${b.dataset.del} wird unwiderruflich gelöscht.`, 'Löschen', 'btn-danger')) {
      deleteSlot(+b.dataset.del); app.go('menu');
    }
  });
  const file = root.querySelector('#file-import');
  root.querySelector('#btn-import').onclick = () => {
    modal({
      title: 'In welchen Slot importieren?',
      body: '<p class="muted">Ein vorhandener Spielstand im Slot wird überschrieben.</p>',
      actions: [1, 2, 3].map(n => ({ label: `Slot ${n}`, cls: 'btn-primary', onClick: () => { file.dataset.slot = n; file.click(); } })),
    });
  };
  file.onchange = async () => {
    const f = file.files[0]; if (!f) return;
    try {
      const s = await importGame(f, +file.dataset.slot);
      saveGame(s); app.state = s;
      toast('Spielstand importiert', 'success');
      app.go(s.ended ? 'careerEnd' : 'hub');
    } catch (e) { toast(e.message || 'Import fehlgeschlagen', 'error'); }
    file.value = '';
  };
}
