// Team: Manager (Provision, Sponsor-Angebote, Ziele) und Fitnesstrainer (Wochengebühr, Energie-Erholung)
import { managersOf, trainersOf, managerOf, managerOk, hireManager, fireManager, trainerOf, trainerFee, hireTrainer, fireTrainer } from '../../../career.js';
import { frame, header, titleBand, darkBar, meter, coin, bar, bindHead } from '../frame.js';
import { toast, confirmDialog } from '../../components.js';

export const nsd = true;
const HELP = '<p><b>Manager</b>: bekommt Provision auf dein Preisgeld, besorgt dafür mehr und bessere Sponsor-Angebote. Gute Manager nehmen nur Spieler mit Star-Status oder Ranglistenplatz. Verpasste Saisonziele kosten Beziehung – bei 0 kündigt er.</p><p><b>Fitnesstrainer</b>: kostet jede Woche ★ und bringt zusätzliche Energie-Erholung.</p>';

export function render(app) {
  const s = app.state, p = s.player, m = managerOf(s), t = trainerOf(s), lvl = p.star.level;
  return frame({
    body: `${header(p.name)}${titleBand('Team')}
      ${darkBar(m ? `💼 ${m.name}` : 'Kein Manager', 'sm')}
      ${m ? `<div class="nsd-meters one">${meter({ label: `Beziehung ${Math.round(p.rel.manager)}`, pct: p.rel.manager })}</div>` : ''}
      <div class="nsd-evs">${managersOf(s).map(x => {
        const on = m?.id === x.id, ok = managerOk(s, x);
        return `<div class="nsd-ev ${on ? 'on' : ok ? '' : 'off'}"><div class="nsd-ev-main"><div class="nsd-ev-name">${x.icon} ${x.name}</div>
          <div class="nsd-ev-sub">${x.info}</div><div class="nsd-ev-sub">Provision ${Math.round(x.cut * 100)} % · Sponsoren ×${String(x.mult).replace('.', ',')}</div>
          ${ok ? '' : `<div class="nsd-ev-sub">Ab Star-Status ${x.needStar}${x.needRank ? ` oder PDC Top ${x.needRank}` : ''}</div>`}</div>
          ${on ? '<button class="nsd-btn" id="m-fire"><span class="lb">Entlassen</span></button>' : ok ? `<button class="nsd-btn" data-m="${x.id}"><span class="lb">Holen</span></button>` : ''}</div>`;
      }).join('')}</div>
      ${darkBar(t ? `🏃 ${t.name}` : 'Kein Fitnesstrainer', 'sm')}
      <div class="nsd-evs">${trainersOf(s).map(x => {
        const on = t?.id === x.id;
        return `<div class="nsd-ev ${on ? 'on' : ''}"><div class="nsd-ev-main"><div class="nsd-ev-name">${x.icon} ${x.name}</div>
          <div class="nsd-ev-sub">Erholung +${x.regen} % pro Woche</div><div class="nsd-ev-sub">Gebühr ${coin(trainerFee(x, lvl))} pro Woche</div></div>
          ${on ? '<button class="nsd-btn" id="f-fire"><span class="lb">Entlassen</span></button>' : `<button class="nsd-btn" data-f="${x.id}"><span class="lb">Holen</span></button>`}</div>`;
      }).join('')}</div>`,
    bottom: bar([{ go: 'hub', icon: '🏠', label: 'Start' }, { go: 'life', icon: '👥', label: 'Leben' }, { go: 'sponsors', icon: '🤝', label: 'Sponsoren', wide: true }]),
  });
}
export function mount(root, app) {
  const s = app.state, run = fn => { try { fn(); app.save(); app.refresh(); } catch (e) { toast(e.message, 'error'); } };
  bindHead(root, app, HELP);
  root.querySelectorAll('[data-m]').forEach(b => b.onclick = async () => {
    if (managerOf(s) && !await confirmDialog('Manager wechseln?', 'Dein bisheriger Manager geht.', 'Wechseln')) return;
    run(() => { fireManager(s, false); hireManager(s, b.dataset.m); });
  });
  root.querySelectorAll('[data-f]').forEach(b => b.onclick = () => run(() => hireTrainer(s, b.dataset.f)));
  root.querySelector('#m-fire')?.addEventListener('click', async () => { if (await confirmDialog('Manager entlassen?', '', 'Entlassen')) run(() => fireManager(s)); });
  root.querySelector('#f-fire')?.addEventListener('click', () => run(() => fireTrainer(s)));
}
