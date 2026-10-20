// Team: Manager (Provision, Sponsor-Angebote, Ziele) und Fitnesstrainer (Festpreis-Paket, Energie-Erholung, wechselnde Angebote)
import { managersOf, managerOf, managerOk, hireManager, fireManager, trainerOf, trainerOffers, trainerWeeksLeft, weekIndex, hireTrainer, fireTrainer } from '../../../career.js';
import { frame, header, titleBand, darkBar, meter, coin, bar, bindHead } from '../frame.js';
import { toast, confirmDialog } from '../../components.js';

export const nsd = true;
const HELP = '<p><b>Manager</b>: bekommt Provision auf dein Preisgeld, besorgt dafür mehr und bessere Sponsor-Angebote. Gute Manager nehmen nur Spieler mit Star-Status oder Ranglistenplatz. Verpasste Saisonziele kosten Beziehung – bei 0 kündigt er.</p><p><b>Fitnesstrainer</b>: Festpreis für eine Anzahl Wochen, bringt in dieser Zeit zusätzliche Energie-Erholung. Alle 12 Wochen gibt es neue Angebote.</p>';

export function render(app) {
  const s = app.state, p = s.player, m = managerOf(s), t = trainerOf(s);
  return frame({
    body: `${header(p.name)}${titleBand('Team')}
      ${darkBar(m ? `💼 ${m.name}` : 'Kein Manager', 'sm')}
      ${m ? `<div class="nsd-meters one">${meter({ label: `Beziehung ${Math.round(p.rel.manager)}`, pct: p.rel.manager })}</div>` : ''}
      <div class="nsd-evs">${managersOf(s).map(x => {
        const on = m?.id === x.id, ok = managerOk(s, x);
        return `<div class="nsd-ev ${on ? 'on' : ok ? '' : 'off'}"><div class="nsd-ev-main"><div class="nsd-ev-name">${x.icon} ${x.name}</div>
          <div class="nsd-ev-sub">${x.info}</div><div class="nsd-ev-sub">Provision ${Math.round(x.cut * 100)} % · Angebote ${Math.round(x.offer * 100)} %/Woche · Beträge ×${String(x.mult).replace('.', ',')} · Sponsoren bis Stufe ${x.tier}</div>
          ${ok ? '' : `<div class="nsd-ev-sub">Ab Star-Status ${x.needStar}${x.needRank ? ` oder PDC Top ${x.needRank}` : ''}</div>`}</div>
          ${on ? '<button class="nsd-btn" id="m-fire"><span class="lb">Entlassen</span></button>' : ok ? `<button class="nsd-btn" data-m="${x.id}"><span class="lb">Holen</span></button>` : ''}</div>`;
      }).join('')}</div>
      ${darkBar(t ? `${t.icon ?? '🏃'} ${t.name} · noch ${trainerWeeksLeft(s)} Wo.` : 'Kein Fitnesstrainer', 'sm')}
      ${t ? `<div class="nsd-ev on" style="margin:8px 10px"><div class="nsd-ev-main"><div class="nsd-ev-sub">Erholung +${t.regen} % pro Woche</div></div>
        <button class="nsd-btn" id="f-fire"><span class="lb">Beenden</span></button></div>` : ''}
      <div class="nsd-evs">${trainerOffers(s).map(x => `<div class="nsd-ev"><div class="nsd-ev-main"><div class="nsd-ev-name">${x.icon} ${x.name}</div>
          <div class="nsd-ev-sub">Erholung +${x.regen} % pro Woche · ${x.weeks} Wochen</div><div class="nsd-ev-sub">Festpreis ${coin(x.price)}</div></div>
          <button class="nsd-btn" data-f="${x.id}" ${t ? 'disabled' : ''}><span class="lb">Buchen</span></button></div>`).join('')}</div>
      <div class="nsd-ev-sub" style="padding:4px 14px 10px">Neue Angebote in ${Math.max(1, (s.team.offersUntil ?? 0) - weekIndex(s))} Wochen.</div>`,
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
  root.querySelector('#f-fire')?.addEventListener('click', async () => { if (await confirmDialog('Trainer beenden?', 'Bereits bezahlte Wochen werden nicht erstattet.', 'Beenden')) run(() => fireTrainer(s)); });
}
