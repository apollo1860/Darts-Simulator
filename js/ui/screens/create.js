// Charaktererstellung
import { newCareer, listSlots, saveGame } from '../../state.js';
import { NATIONS } from '../../../data/nations.js';
import { RNG, randomSeed } from '../../rng.js';
import { startAttrs, EXP_MIN } from '../../player.js';
import { REGIONS, DEFAULT_REGION } from '../../../data/regions.js';
import { esc } from '../../util.js';
import { topbar, futCard, toast, confirmDialog } from '../components.js';

const form = { name: '', nation: 'DE', region: DEFAULT_REGION, hand: 'R', slot: 1, seed: randomSeed() };

function previewPlayer() {
  return {
    id: 'P', name: form.name.trim() || 'Dein Name', nation: form.nation, age: 18, tour: 'none',
    attrs: startAttrs(), exp: EXP_MIN,
  };
}

export function render() {
  const slots = listSlots();
  // Standard: erster freier Slot (bis der Nutzer selbst wählt)
  if (!form.slotTouched) form.slot = slots.find(s => s.empty)?.slot ?? 1;
  return `${topbar({ title: 'Neue Karriere', sub: 'Start: Januar 2027 · 18 Jahre · 5.000 €', back: 'menu' })}
  <div class="two-col card-left">
    <div class="card-stage" id="preview">${futCard(previewPlayer(), { me: true })}</div>
    <div class="panel stack">
      <div class="field"><label class="label" for="f-name">Name</label>
        <input class="input" id="f-name" maxlength="28" placeholder="Vor- und Nachname" value="${esc(form.name)}" autocomplete="off"></div>
      <div class="field"><label class="label" for="f-nation">Nation</label>
        <select class="select" id="f-nation">${Object.entries(NATIONS).map(([c, n]) =>
          `<option value="${c}" ${c === form.nation ? 'selected' : ''}>${n.flag} ${n.name}</option>`).join('')}</select></div>
      <div class="field ${form.nation === 'DE' ? '' : 'hidden'}" id="f-region-field"><label class="label" for="f-region">Bundesland</label>
        <select class="select" id="f-region">${Object.entries(REGIONS).map(([c, r]) =>
          `<option value="${c}" ${c === form.region ? 'selected' : ''}>${r.name}</option>`).join('')}</select>
        <span class="muted" style="font-size:.78rem">Lokale Turniere gibt es nur in deinem Bundesland.</span></div>
      <div class="field"><span class="label">Wurfhand</span>
        <div class="segmented" id="f-hand">
          <button data-h="R" class="${form.hand === 'R' ? 'active' : ''}">Rechts</button>
          <button data-h="L" class="${form.hand === 'L' ? 'active' : ''}">Links</button>
        </div></div>
      <div class="field"><span class="label">Speicher-Slot</span>
        <div class="segmented" id="f-slot">${slots.map(s =>
          `<button data-s="${s.slot}" class="${form.slot === s.slot ? 'active' : ''}">${s.slot}${s.empty ? '' : ' ●'}</button>`).join('')}</div>
        <span class="muted" style="font-size:.78rem">● = belegt (wird überschrieben)</span></div>
      <p class="muted" style="font-size:.8rem;margin:0">Alle Attribute starten bei 60 von 100 (stärker als 60 von 100 Dartspielern), Erfahrung bei −4.</p>
      <button class="btn btn-primary btn-block btn-continue" id="start">Karriere starten</button>
    </div>
  </div>`;
}

export function mount(root, app) {
  const upd = () => { root.querySelector('#preview').innerHTML = futCard(previewPlayer(), { me: true }); };
  const name = root.querySelector('#f-name');
  name.oninput = () => { form.name = name.value; upd(); };
  root.querySelector('#f-nation').onchange = e => { form.nation = e.target.value; root.querySelector('#f-region-field').classList.toggle('hidden', form.nation !== 'DE'); upd(); };
  root.querySelector('#f-region').onchange = e => { form.region = e.target.value; };
  root.querySelector('#f-hand').onclick = e => {
    const b = e.target.closest('[data-h]'); if (!b) return;
    form.hand = b.dataset.h; app.refresh();
  };
  root.querySelector('#f-slot').onclick = e => {
    const b = e.target.closest('[data-s]'); if (!b) return;
    form.slot = +b.dataset.s; form.slotTouched = true; app.refresh();
  };
  root.querySelector('#start').onclick = async () => {
    const n = form.name.trim();
    if (n.length < 2) { toast('Bitte einen Namen eingeben', 'error'); name.focus(); return; }
    const occupied = !listSlots().find(s => s.slot === form.slot).empty;
    if (occupied && !await confirmDialog('Slot überschreiben?', `In Slot ${form.slot} liegt bereits ein Spielstand.`, 'Überschreiben', 'btn-danger')) return;
    app.state = newCareer({ ...form, name: n });
    saveGame(app.state);
    form.name = ''; form.seed = randomSeed(); form.slotTouched = false;
    app.go('hub');
  };
}
