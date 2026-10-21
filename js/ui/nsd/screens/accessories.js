// Zubehör-Shop: Flights, Shafts, Leih-Darts … boosten Fähigkeiten für einige eigene Matches
import { accessoryPrice, buyAccessory, shopOffers, shopWeeksLeft } from '../../../skilltrain.js';
import { TRAINABLE } from '../../../nsd.js';
import { frame, header, titleBand, darkBar, coin, bar, bindHead, flightIcon, barrelIcon } from '../frame.js';
import { toast } from '../../components.js';

export const nsd = true;
const bonusTxt = b => { const v = TRAINABLE.map(t => b[t.key] ?? 0); return v.every(x => x && x === v[0]) ? `Alle Fähigkeiten +${v[0]}` : TRAINABLE.filter(t => b[t.key]).map(t => `${t.label} +${b[t.key]}`).join(' · '); };
// Eigene Grafik statt Emoji: Flight-Farbe nach Stärke (blau/grün/rot, Premium gold), sonst Barrel
const gfx = a => { const v = a.bonus?.sco ?? 0;
  return /Flight/.test(a.type ?? '') || a.icon === '🪶' || a.icon === '💎' ? flightIcon(v > 25 ? 3 : v > 15 ? 2 : v > 6 ? 1 : 0) : barrelIcon(); };
const HELP = '<p>Zubehör gibt für die nächsten eigenen Matches Bonuspunkte auf Fähigkeiten (max. 60). Nach jedem Match läuft ein Match ab. Nochmal kaufen verlängert die Laufzeit. Alle 12 Wochen wechselt das Angebot (Namen, Boosts, Preise). Preise steigen mit dem Star-Status.</p><p>Dauerhafte Darts gibt es im Darts-Shop.</p>';

export function render(app) {
  const s = app.state, p = s.player, lvl = p.star.level, act = p.boosts ?? [];
  return frame({
    body: `${header(p.name)}${titleBand('Shop')}
      <div class="nsd-strip"><span>Zubehör</span><span class="mid">Guthaben</span><span class="r">${coin(s.stars ?? 0)}</span></div>
      ${act.length ? `${darkBar('Aktiv', 'sm')}<div class="nsd-evs">${act.map(b => `<div class="nsd-ev on"><div class="nsd-ev-main"><div class="nsd-ev-name">${gfx(b)}${b.name}</div>
        <div class="nsd-ev-sub">${bonusTxt(b.bonus)} · ${b.until != null ? `bis KW ${((b.until - 1) % 52) + 1}` : `noch ${b.left} Match${b.left > 1 ? 'es' : ''}`}</div></div></div>`).join('')}</div>` : ''}
      ${darkBar(`Angebot · neu in ${shopWeeksLeft(s)} Wochen`, 'sm')}
      <div class="nsd-evs">${shopOffers(s).map(a => `<div class="nsd-ev"><div class="nsd-ev-main"><div class="nsd-ev-name">${gfx(a)}${a.name}</div>
        <div class="nsd-ev-sub">${a.type} · ${bonusTxt(a.bonus)} · ${a.weeks ? `${a.weeks} Wochen` : `${a.matches} Matches`}</div><div class="nsd-ev-sub">Preis ${coin(accessoryPrice(a, lvl))}</div></div>
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
