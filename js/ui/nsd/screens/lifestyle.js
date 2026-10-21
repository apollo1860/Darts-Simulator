// Lifestyle-Shop: Gegenstände, Fahrzeuge, Immobilien einmalig kaufen (Lifestyle, Zufriedenheit, Immobilien: Energie-Erholung)
import { LIFESTYLE, LIFESTYLE_CATS } from '../../../../data/lifestyle.js';
import { fmtNum } from '../../../util.js';
import { lifeArt } from '../art/index.js';
import { itemPrice, buyItem, lifestyleOf, homeRegen, repairCost, repairItem, weeksToRepair, brokenItems } from '../../../life.js';
import { frame, header, titleBand, meter, coin, bar, bindHead } from '../frame.js';
import { toast, confirmDialog } from '../../components.js';

export const nsd = true;
let tab = 0;
const HELP = '<p>Alles wird einmalig gekauft und gehört dir für immer. Lifestyle steigert deine Zufriedenheit; die beste Immobilie gibt dir zusätzliche Energie-Erholung pro Woche. Die Preise sind fest und steigen nicht mit dem Star-Status.</p><p><b>Wartung:</b> Jedes Produkt geht etwa alle 12–16 Wochen kaputt. Die Reparatur kostet 10–15 % des Kaufpreises. Solange es kaputt ist, zählt es nicht für Lifestyle und Erholung.</p>';

export function render(app) {
  const s = app.state, p = s.player, [cat, label] = LIFESTYLE_CATS[tab];
  return frame({
    body: `${header(p.name)}${titleBand('Lifestyle')}
      <div class="nsd-meters">${meter({ icon: '<span style="font-size:2rem">💎</span>', label: `Lifestyle ${fmtNum(lifestyleOf(p), 1)}`, pct: lifestyleOf(p) })}
        ${meter({ icon: '<span style="font-size:2rem">🛌</span>', label: `Erholung +${homeRegen(p)}`, pct: homeRegen(p) * 5 })}</div>
      <div class="nsd-pager"><button data-t="-1">◀</button><b>${label}</b><button data-t="1">▶</button></div>
      <div class="nsd-strip"><span></span><span class="mid">Guthaben</span><span class="r">${coin(s.stars ?? 0)}</span></div>
      ${brokenItems(p).length ? `<div class="nsd-dark nsd-alert">🔧 ${brokenItems(p).length} kaputt – Reparatur ${brokenItems(p).reduce((a, x) => a + repairCost(p, x), 0)} ★ gesamt</div>` : ''}
      <div class="nsd-evs">${LIFESTYLE.filter(x => x.cat === cat).map(it => {
        const own = p.owned?.includes(it.id), broken = own && p.upkeep?.[it.id]?.broken, weeks = own && !broken ? weeksToRepair(s, it.id) : 0;
        return `<div class="nsd-ev nsd-ls ${it.cat === 'home' ? 'home' : ''} ${own && !broken ? 'on' : ''} ${broken ? 'broken' : ''}">
          <div class="nsd-ls-art">${lifeArt(it.id) || `<span class="nsd-ls-emoji">${it.icon}</span>`}</div>
          <div class="nsd-ev-main"><div class="nsd-ev-name">${it.name}</div>
            <div class="nsd-ev-sub nsd-ls-stats"><span>Lifestyle +${fmtNum(it.ls, 1)}</span><span>Zufriedenheit +${it.sat}</span>${it.regen ? `<span>Erholung +${it.regen} %</span>` : ''}</div>
            ${!own ? `<div class="nsd-ev-sub">Preis ${coin(itemPrice(it))}</div>`
              : broken ? `<div class="nsd-ev-sub nsd-bad">🔧 Kaputt – wirkt nicht mehr</div><div class="nsd-ev-sub">Reparatur ${coin(repairCost(p, it))}</div>`
              : `<div class="nsd-ev-sub">Wartung in ca. ${weeks} Woche${weeks === 1 ? '' : 'n'}</div>`}</div>
          ${!own ? `<button class="nsd-btn" data-buy="${it.id}"><span class="lb">Kaufen</span></button>`
            : broken ? `<button class="nsd-btn" data-fix="${it.id}"><span class="lb">Reparieren</span></button>`
            : '<div class="nsd-ev-why" style="color:#8dff6a">✔ Gehört dir</div>'}
        </div>`;
      }).join('')}</div>`,
    bottom: bar([{ go: 'hub', icon: '🏠', label: 'Start' }, { go: 'life', icon: '👥', label: 'Leben' }, { go: 'drinks', icon: '🍺', label: 'Getränke', wide: true }]),
  });
}

export function mount(root, app) {
  const s = app.state;
  bindHead(root, app, HELP);
  root.querySelectorAll('[data-t]').forEach(b => b.onclick = () => { tab = (tab + +b.dataset.t + LIFESTYLE_CATS.length) % LIFESTYLE_CATS.length; app.refresh(); });
  root.querySelectorAll('[data-buy]').forEach(b => b.onclick = async () => {
    const it = LIFESTYLE.find(x => x.id === b.dataset.buy);
    if (!await confirmDialog(`${it.name} kaufen?`, `Kostet ${itemPrice(it)} ★.`, 'Kaufen')) return;
    try { buyItem(s, it.id); app.save(); toast(`${it.icon} ${it.name} gehört jetzt dir!`); app.refresh(); } catch (e) { toast(e.message, 'error'); }
  });
  root.querySelectorAll('[data-fix]').forEach(b => b.onclick = async () => {
    const it = LIFESTYLE.find(x => x.id === b.dataset.fix), cost = repairCost(s.player, it);
    if (!await confirmDialog(`${it.name} reparieren?`, `Kostet ${cost} ★.`, 'Reparieren')) return;
    try { repairItem(s, it.id); app.save(); toast(`🔧 ${it.name} repariert`); app.refresh(); } catch (e) { toast(e.message, 'error'); }
  });
}
