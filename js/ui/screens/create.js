// Charaktererstellung
import { newCareer, listSlots, saveGame } from '../../state.js';
import { NATIONS } from '../../../data/nations.js';
import { RNG, randomSeed } from '../../rng.js';
import { startAttrs, EXP_MIN, ATTRS, START_VALUE, CREATION_POINTS } from '../../player.js';
import { REGIONS, DEFAULT_REGION } from '../../../data/regions.js';
import { esc } from '../../util.js';
import { topbar, futCard, toast, confirmDialog } from '../components.js';

const form = { name: '', nation: 'DE', region: DEFAULT_REGION, hand: 'R', slot: 1, seed: randomSeed(), bonus: {} };
const spent = () => Object.values(form.bonus).reduce((a, b) => a + b, 0);
const left = () => CREATION_POINTS - spent();

function previewPlayer() {
  return {
    id: 'P', name: form.name.trim() || 'Dein Name', nation: form.nation, age: 16, tour: 'none',
    attrs: startAttrs(form.bonus), exp: EXP_MIN,
  };
}

// Bonuspunkte: alle starten bei 60, 25 Punkte frei verteilen (1 Punkt = +1)
function attrPanel() {
  const l = left();
  return `<div class="row-between"><span class="label">Attribute · Bonuspunkte</span>
      <span class="badge ${l ? 'badge-green' : ''}">${l} / ${CREATION_POINTS} übrig</span></div>
    <p class="muted" style="font-size:.78rem;margin:0">Alle Werte starten bei ${START_VALUE} (stärker als ${START_VALUE} von 100 Dartspielern). Verteile ${CREATION_POINTS} Bonuspunkte frei – auch alle auf ein Attribut. Erfahrung startet bei −4.</p>
    ${ATTRS.map(a => {
      const b = form.bonus[a.key] ?? 0;
      return `<div class="attr-row" style="grid-template-columns:1fr auto auto auto">
        <div><div class="attr-name">${a.label} <span class="dim" style="font-size:.72rem">${a.info}</span></div>
          <div class="attr-bar"><i style="width:${START_VALUE + b}%"></i></div></div>
        <button class="icon-btn" data-dec="${a.key}" ${b ? '' : 'disabled'} style="color:var(--red)">−</button>
        <div class="attr-val">${START_VALUE + b}${b ? `<span class="pos" style="font-size:.8rem;margin-left:2px">+${b}</span>` : ''}</div>
        <button class="icon-btn" data-inc="${a.key}" ${l ? '' : 'disabled'}>+</button>
      </div>`;
    }).join('')}
    <div class="row"><button class="btn btn-sm btn-ghost" id="b-even">Gleichmäßig (je 5)</button><button class="btn btn-sm btn-ghost" id="b-reset">Zurücksetzen</button></div>`;
}

export function render() {
  const slots = listSlots();
  // Standard: erster freier Slot (bis der Nutzer selbst wählt)
  if (!form.slotTouched) form.slot = slots.find(s => s.empty)?.slot ?? 1;
  return `${topbar({ title: 'Neue Karriere', sub: 'Start: Januar 2027 · 16 Jahre · 5.000 €', back: 'menu' })}
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
      <div class="field" id="f-attrs">${attrPanel()}</div>
      <button class="btn btn-primary btn-block btn-continue" id="start" ${left() ? 'disabled' : ''}>${left() ? `Noch ${left()} Punkte verteilen` : 'Karriere starten'}</button>
    </div>
  </div>`;
}

export function mount(root, app) {
  const upd = () => { root.querySelector('#preview').innerHTML = futCard(previewPlayer(), { me: true }); };
  const name = root.querySelector('#f-name');
  name.oninput = () => { form.name = name.value; upd(); };
  root.querySelector('#f-nation').onchange = e => { form.nation = e.target.value; root.querySelector('#f-region-field').classList.toggle('hidden', form.nation !== 'DE'); upd(); };
  root.querySelector('#f-region').onchange = e => { form.region = e.target.value; };
  const attrs = root.querySelector('#f-attrs');
  attrs.onclick = e => {
    const inc = e.target.closest('[data-inc]'), dec = e.target.closest('[data-dec]');
    if (inc && left() > 0) form.bonus[inc.dataset.inc] = (form.bonus[inc.dataset.inc] ?? 0) + 1;
    else if (dec && form.bonus[dec.dataset.dec] > 0) form.bonus[dec.dataset.dec]--;
    else if (e.target.closest('#b-even')) form.bonus = Object.fromEntries(ATTRS.map(a => [a.key, CREATION_POINTS / ATTRS.length]));
    else if (e.target.closest('#b-reset')) form.bonus = {};
    else return;
    attrs.innerHTML = attrPanel();
    const st = root.querySelector('#start');
    st.disabled = left() > 0; st.textContent = left() ? `Noch ${left()} Punkte verteilen` : 'Karriere starten';
    upd();
  };
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
    if (left() > 0) { toast(`Noch ${left()} Bonuspunkte verteilen`, 'error'); return; }
    const occupied = !listSlots().find(s => s.slot === form.slot).empty;
    if (occupied && !await confirmDialog('Slot überschreiben?', `In Slot ${form.slot} liegt bereits ein Spielstand.`, 'Überschreiben', 'btn-danger')) return;
    app.state = newCareer({ ...form, name: n });
    saveGame(app.state);
    form.name = ''; form.seed = randomSeed(); form.slotTouched = false; form.bonus = {};
    app.go('hub');
  };
}
