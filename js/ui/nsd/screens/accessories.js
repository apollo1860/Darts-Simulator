// Zubehör-Shop: Flights, Shafts, Leih-Darts … boosten Fähigkeiten für einige eigene Matches
import { ACCESSORIES } from '../../../../data/accessories.js';
import { accessoryPrice, buyAccessory } from '../../../skilltrain.js';
import { TRAINABLE } from '../../../nsd.js';
import { frame, header, titleBand, darkBar, coin, bar, bindHead } from '../frame.js';
import { toast } from '../../components.js';

export const nsd = true;
const bonusTxt = b => TRAINABLE.filter(t => b[t.key]).map(t => `${t.label} +${b[t.key]}`).join(' · ');
const HELP = '<p>Zubehör gibt für die nächsten eigenen Matches Bonuspunkte auf Fähigkeiten (max. 60). Nach jedem Match läuft ein Match ab. Nochmal kaufen verlängert die Laufzeit. Preise steigen mit dem Star-Status.</p><p>Dauerhafte Darts gibt es im Darts-Shop.</p>';

export function render(app) {
  const s = app.state, p = s.player, lvl = p.star.level, act = p.boosts ?? [];
  return frame({
    body: `${header(p.name)}${titleBand('Shop')}
      <div class="nsd-strip"><span>Zubehör</span><span class="mid">Guthaben</span><span class="r">${coin(s.stars ?? 0)}</span></div>
      ${act.length ? `${darkBar('Aktiv', 'sm')}<div class="nsd-evs">${act.map(b => `<div class="nsd-ev on"><div class="nsd-ev-main"><div class="nsd-ev-name">${b.icon ?? '🎯'} ${b.name}</div>
        <div class="nsd-ev-sub">${bonusTxt(b.bonus)} · noch ${b.left} Match${b.left > 1 ? 'es' : ''}</div></div></div>`).join('')}</div>` : ''}
      ${darkBar('Angebot', 'sm')}
      <div class="nsd-evs">${ACCESSORIES.map(a => `<div class="nsd-ev"><div class="nsd-ev-main"><div class="nsd-ev-name">${a.icon} ${a.name}</div>
        <div class="nsd-ev-sub">${bonusTxt(a.bonus)} · ${a.matches} Matches</div><div class="nsd-ev-sub">Preis ${coin(accessoryPrice(a, lvl))}</div></div>
        <button class="nsd-btn" data-buy="${a.id}"><span class="lb">Kaufen</span></button></div>`).join('')}</div>`,
    bottom: bar([{ go: 'hub', icon: '🏠', label: 'Start' }, { go: 'darts', icon: '🎯', label: 'Darts' }, { go: 'drinks', icon: '🍺', label: 'Getränke', wide: true }]),
  });
}
export function mount(root, app) {
  bindHead(root, app, HELP);
  root.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => {
    try { buyAccessory(app.state, b.dataset.buy); app.save(); toast('Gekauft!'); app.refresh(); } catch (e) { toast(e.message, 'error'); }
  });
}
