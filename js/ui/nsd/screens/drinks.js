// Getränke: kaufen (★, Preis steigt mit dem Status) und trinken – Bier: Energie, Weinschorle: + 1 Fähigkeitspunkt, Schnaps: + 4–5 Beziehung (Version 230, wählbar)
import { DRINKS, DRINK_MAX } from '../../../../data/gear.js';
import { drinkPrice, buyDrink, drink } from '../../../skilltrain.js';
import { relLabelOf } from '../../../nsd.js';
import { RNG } from '../../../rng.js';
import { frame, header, titleBand, meter, heartIcon, coin, bar, bindHead } from '../frame.js';
import { toast } from '../../components.js';
import { icon as nicon } from '../icons.js';

export const nsd = true;
const HELP = '<p><b>Bier</b> füllt die Energie auf 100 %. <b>Weinschorle</b> füllt die Energie und gibt dauerhaft +1 Punkt auf eine Fähigkeit deiner Wahl. <b>Schnaps</b> füllt die Energie und verbessert eine Beziehung deiner Wahl dauerhaft um 4–5 Punkte.</p><p>Preise steigen mit deinem Star-Status.</p>';

export function render(app) {
  const s = app.state, p = s.player, e = Math.round(p.energy ?? 100), lvl = p.star.level;
  return frame({
    body: `${header(p.name)}${titleBand('Getränke')}
      <div class="nsd-meters one">${meter({ icon: heartIcon(), label: `Energie ${e} %`, pct: e, tone: e >= 20 ? 'green' : 'red' })}</div>
      <div class="nsd-strip"><span>${p.hangover ? 'Verkatert' : p.hangoverNext ? 'Betrunken' : p.buzz ? `🥴 +${p.buzz}` : 'Nüchtern'}</span><span class="mid">Guthaben</span><span class="r">${coin(s.stars ?? 0)}</span></div>
      <div class="nsd-evs">${DRINKS.map(d => `<div class="nsd-ev">
        <div class="nsd-ev-main"><div class="nsd-ev-name">${d.icon} ${d.name} <small>× ${p.drinks[d.id] ?? 0} / ${DRINK_MAX}</small></div>
          <div class="nsd-ev-sub">Energie auf 100 %${d.bonus === 'skill' ? ' · +1 Fähigkeit' : d.bonus === 'rel' ? ' · Beziehung +4–5' : ''}</div>
          <div class="nsd-ev-sub">Preis ${coin(drinkPrice(d, lvl))}</div></div>
        <div class="nsd-ev-btns"><button class="nsd-btn" data-buy="${d.id}" ${(p.drinks[d.id] ?? 0) >= DRINK_MAX ? 'disabled' : ''}><span class="lb">${(p.drinks[d.id] ?? 0) >= DRINK_MAX ? 'Voll' : 'Kaufen'}</span></button>
          <button class="nsd-btn" data-drink="${d.id}" ${p.drinks[d.id] > 0 ? '' : 'disabled'}><span class="lb">Trinken</span></button></div>
      </div>`).join('')}</div>`,
    bottom: bar([{ go: 'hub', icon: nicon('home'), label: 'Start' }, { go: 'skills', icon: nicon('skill'), label: 'Fähigkeit' }, { go: 'darts', icon: nicon('shop'), label: 'Darts-Shop', wide: true }]),
  });
}

export function mount(root, app) {
  const s = app.state;
  if (s.player.drinkBonus) return app.go('drinkbonus', { back: 'drinks' });   // offener Bonus (z. B. nach Neuladen)
  bindHead(root, app, HELP);
  root.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => {
    try { buyDrink(s, b.dataset.buy); app.save(); app.refresh(); } catch (e) { toast(e.message, 'error'); }
  });
  root.querySelectorAll('[data-drink]').forEach(b => b.onclick = () => {
    try {
      const r = drink(s, b.dataset.drink, new RNG(s.rng)); app.save();
      if (r.drunk) toast('🥴 Du hast eindeutig zu viel getrunken … Nächste Woche wirst du einen üblen Kater haben!', 'error');
      else toast(`Prost! Energie ${r.energy} %`);
      if (r.bonus) return app.go('drinkbonus', { back: 'drinks' });   // Version 230: Bonus wählen
      app.refresh();
    } catch (e) { toast(e.message, 'error'); }
  });
}
