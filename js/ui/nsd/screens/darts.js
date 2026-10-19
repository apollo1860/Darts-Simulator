// Darts-Shop: Sets kaufen und ausrüsten (dauerhafter Bonus auf Fähigkeiten, solange ausgerüstet)
import { DARTS } from '../../../../data/gear.js';
import { dartsPrice, buyDarts, equipDarts } from '../../../skilltrain.js';
import { TRAINABLE } from '../../../nsd.js';
import { frame, header, titleBand, coin, bar, bindHead } from '../frame.js';
import { toast, confirmDialog } from '../../components.js';

export const nsd = true;
const bonusTxt = b => TRAINABLE.filter(t => b[t.key]).map(t => `${t.label} +${b[t.key]}`).join(' · ');

export function render(app) {
  const s = app.state, p = s.player, lvl = p.star.level;
  return frame({
    body: `${header(p.name)}${titleBand('Darts-Shop')}
      <div class="nsd-strip"><span>${p.gear ? 'Ausgerüstet' : 'Keine Darts'}</span><span class="mid">Guthaben</span><span class="r">${coin(s.stars ?? 0)}</span></div>
      <div class="nsd-evs">${DARTS.map(d => {
        const own = p.darts?.includes(d.id), on = p.gear?.id === d.id;
        return `<div class="nsd-ev ${on ? 'on' : ''}">
          <div class="nsd-ev-main"><div class="nsd-ev-name">🎯 ${d.name}</div><div class="nsd-ev-sub">${bonusTxt(d.bonus)}</div>
            ${own ? '' : `<div class="nsd-ev-sub">Preis ${coin(dartsPrice(d, lvl))}</div>`}</div>
          ${on ? '<div class="nsd-ev-why" style="color:#8dff6a">✔ Im Einsatz</div>'
            : own ? `<button class="nsd-btn" data-eq="${d.id}"><span class="lb">Nehmen</span></button>`
              : `<button class="nsd-btn" data-buy="${d.id}"><span class="lb">Kaufen</span></button>`}
        </div>`;
      }).join('')}</div>`,
    bottom: bar([{ go: 'hub', icon: '🏠', label: 'Start' }, { go: 'skills', icon: '🎯', label: 'Fähigkeit' }, { go: 'drinks', icon: '🍺', label: 'Getränke', wide: true }]),
  });
}

export function mount(root, app) {
  const s = app.state;
  bindHead(root, app, '<p>Bessere Darts geben dauerhaft Bonuspunkte auf deine Fähigkeiten (max. 60), solange du sie benutzt. Preise steigen mit deinem Star-Status.</p>');
  root.querySelectorAll('[data-buy]').forEach(b => b.onclick = async () => {
    const d = DARTS.find(x => x.id === b.dataset.buy);
    if (!await confirmDialog(`${d.name} kaufen?`, `Kostet ${dartsPrice(d, s.player.star.level)} ★.`, 'Kaufen')) return;
    try { buyDarts(s, d.id); app.save(); toast(`${d.name} ausgerüstet!`); app.refresh(); } catch (e) { toast(e.message, 'error'); }
  });
  root.querySelectorAll('[data-eq]').forEach(b => b.onclick = () => { equipDarts(s, b.dataset.eq); app.save(); app.refresh(); });
}
