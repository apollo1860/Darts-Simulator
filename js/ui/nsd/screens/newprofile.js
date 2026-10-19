// Spielerprofil erstellen: Vorname, Nachname, Nation, Alter, Wurfhand
import { NATIONS } from '../../../../data/nations.js';
import { START_AGES } from '../../../player.js';
import { newNsdCareer } from '../../../nsd.js';
import { saveGame, listSlots } from '../../../state.js';
import { randomSeed } from '../../../rng.js';
import { esc } from '../../../util.js';
import { frame, titleBand, darkBar, bar } from '../frame.js';
import { toast, confirmDialog } from '../../components.js';

export const nsd = true;
const form = { first: '', last: '', nation: 'DE', age: 18, hand: 'R' };

export function render() {
  const ages = Array.from({ length: START_AGES[1] - START_AGES[0] + 1 }, (_, i) => START_AGES[0] + i);
  return frame({
    body: `${titleBand('Spielerprofil erstellen')}
    <div class="nsd-rows">
      ${darkBar('Vorname')}<input class="nsd-input" id="p-first" maxlength="16" value="${esc(form.first)}" autocomplete="off">
      ${darkBar('Nachname')}<input class="nsd-input" id="p-last" maxlength="18" value="${esc(form.last)}" autocomplete="off">
      ${darkBar('Nation')}
      <div class="nsd-field arrow"><select class="nsd-select" id="p-nation">${Object.entries(NATIONS).map(([c, n]) =>
        `<option value="${c}" ${c === form.nation ? 'selected' : ''}>${n.name}</option>`).join('')}</select></div>
      <div class="nsd-grid2">
        <div class="nsd-stack">${darkBar('Alter', 'sm')}
          <div class="nsd-field"><select class="nsd-select" id="p-age" style="font-size:1.3rem;height:48px">${ages.map(a =>
            `<option value="${a}" ${a === form.age ? 'selected' : ''}>${a} Jahre</option>`).join('')}</select></div></div>
        <div class="nsd-stack">${darkBar('Wurfhand', 'sm')}
          <div class="nsd-seg" id="p-hand">${[['R', 'Rechts'], ['L', 'Links']].map(([h, l]) =>
            `<button class="nsd-btn ${form.hand === h ? 'blue' : ''}" data-h="${h}"><span class="lb">${l}</span></button>`).join('')}</div></div>
      </div>
    </div>`,
    bottom: bar([{ go: 'slots', icon: '<span style="color:#2bd33a">⬅</span>', label: 'Zurück' }, null, { id: 'p-ok', icon: '<span class="nsd-check">✔</span>', wide: true }]),
  });
}

export function mount(root, app, params) {
  const f = root.querySelector('#p-first'), l = root.querySelector('#p-last');
  f.oninput = () => { form.first = f.value; };
  l.oninput = () => { form.last = l.value; };
  root.querySelector('#p-nation').onchange = e => { form.nation = e.target.value; };
  root.querySelector('#p-age').onchange = e => { form.age = +e.target.value; };
  root.querySelector('#p-hand').onclick = e => { const b = e.target.closest('[data-h]'); if (b) { form.hand = b.dataset.h; app.refresh(); } };
  root.querySelector('#p-ok').onclick = async () => {
    const first = form.first.trim(), last = form.last.trim();
    if (first.length < 2 || last.length < 2) return toast('Bitte Vor- und Nachnamen eingeben', 'error');
    const slot = params.slot ?? 1;
    if (!listSlots().find(s => s.slot === slot).empty && !await confirmDialog('Slot überschreiben?', `In Slot ${slot} liegt bereits ein Spielstand.`, 'Überschreiben')) return;
    app.state = newNsdCareer({ first, last, nation: form.nation, age: form.age, hand: form.hand, slot, seed: randomSeed() });
    saveGame(app.state);
    form.first = ''; form.last = '';
    app.go('intro');
  };
}
