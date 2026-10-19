// Lifestyle-Shop: Gegenstände, Fahrzeuge, Immobilien einmalig kaufen (Lifestyle, Zufriedenheit, Immobilien: Energie-Erholung)
import { LIFESTYLE, LIFESTYLE_CATS } from '../../../../data/lifestyle.js';
import { fmtNum } from '../../../util.js';
import { itemPrice, buyItem, lifestyleOf, homeRegen } from '../../../life.js';
import { frame, header, titleBand, meter, coin, bar, bindHead } from '../frame.js';
import { toast, confirmDialog } from '../../components.js';

export const nsd = true;
let tab = 0;
const HELP = '<p>Alles wird einmalig gekauft und gehört dir für immer. Lifestyle steigert deine Zufriedenheit; die beste Immobilie gibt dir zusätzliche Energie-Erholung pro Woche. Preise steigen mit deinem Star-Status.</p>';

export function render(app) {
  const s = app.state, p = s.player, lvl = p.star.level, [cat, label] = LIFESTYLE_CATS[tab];
  return frame({
    body: `${header(p.name)}${titleBand('Lifestyle')}
      <div class="nsd-meters">${meter({ icon: '<span style="font-size:2rem">💎</span>', label: `Lifestyle ${fmtNum(lifestyleOf(p), 1)}`, pct: lifestyleOf(p) })}
        ${meter({ icon: '<span style="font-size:2rem">🛌</span>', label: `Erholung +${homeRegen(p)}`, pct: homeRegen(p) * 5 })}</div>
      <div class="nsd-pager"><button data-t="-1">◀</button><b>${label}</b><button data-t="1">▶</button></div>
      <div class="nsd-strip"><span></span><span class="mid">Guthaben</span><span class="r">${coin(s.stars ?? 0)}</span></div>
      <div class="nsd-evs">${LIFESTYLE.filter(x => x.cat === cat).map(it => {
        const own = p.owned?.includes(it.id);
        return `<div class="nsd-ev ${own ? 'on' : ''}">
          <div class="nsd-ev-main"><div class="nsd-ev-name">${it.icon} ${it.name}</div>
            <div class="nsd-ev-sub">Lifestyle +${fmtNum(it.ls, 1)} · Zufriedenheit +${it.sat}${it.regen ? ` · Erholung +${it.regen} %` : ''}</div>
            ${own ? '' : `<div class="nsd-ev-sub">Preis ${coin(itemPrice(it, lvl))}</div>`}</div>
          ${own ? '<div class="nsd-ev-why" style="color:#8dff6a">✔ Gehört dir</div>' : `<button class="nsd-btn" data-buy="${it.id}"><span class="lb">Kaufen</span></button>`}
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
    if (!await confirmDialog(`${it.name} kaufen?`, `Kostet ${itemPrice(it, s.player.star.level)} ★.`, 'Kaufen')) return;
    try { buyItem(s, it.id); app.save(); toast(`${it.icon} ${it.name} gehört jetzt dir!`); app.refresh(); } catch (e) { toast(e.message, 'error'); }
  });
}
