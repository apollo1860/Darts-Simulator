// Getränke: kaufen (★, Preis steigt mit dem Status) und trinken – Bier: Energie, Schnaps: + Rausch, Wodka: + Beziehung
import { DRINKS } from '../../../../data/gear.js';
import { drinkPrice, buyDrink, drink } from '../../../skilltrain.js';
import { relLabel } from '../../../nsd.js';
import { RNG } from '../../../rng.js';
import { frame, header, titleBand, meter, heartIcon, coin, bar, bindHead } from '../frame.js';
import { toast } from '../../components.js';

export const nsd = true;
const HELP = '<p><b>Bier</b> gibt Energie. <b>Schnaps</b> gibt Energie und einen Rausch: Bonus auf Scoring, Finishing, Fokus und Rechnen bis zum Wochenende. <b>Wodka</b> wie Schnaps, stärker, und verbessert eine Beziehung um 1.</p><p>Mental bekommt nie einen Bonus. Preise steigen mit deinem Star-Status.</p>';

export function render(app) {
  const s = app.state, p = s.player, e = Math.round(p.energy ?? 100), lvl = p.star.level;
  return frame({
    body: `${header(p.name)}${titleBand('Getränke')}
      <div class="nsd-meters one">${meter({ icon: heartIcon(), label: `Energie ${e} %`, pct: e, tone: e >= 20 ? 'green' : 'red' })}</div>
      <div class="nsd-strip"><span>${p.buzz ? `🥴 +${p.buzz}` : 'Nüchtern'}</span><span class="mid">Guthaben</span><span class="r">${coin(s.stars ?? 0)}</span></div>
      <div class="nsd-evs">${DRINKS.map(d => `<div class="nsd-ev">
        <div class="nsd-ev-main"><div class="nsd-ev-name">${d.icon} ${d.name} <small>× ${p.drinks[d.id] ?? 0}</small></div>
          <div class="nsd-ev-sub">+${d.energy} % Energie${d.buzz ? ` · Rausch +${d.buzz}` : ''}${d.rel ? ' · Beziehung +1' : ''}</div>
          <div class="nsd-ev-sub">Preis ${coin(drinkPrice(d, lvl))}</div></div>
        <div class="nsd-ev-btns"><button class="nsd-btn" data-buy="${d.id}"><span class="lb">Kaufen</span></button>
          <button class="nsd-btn" data-drink="${d.id}" ${p.drinks[d.id] > 0 ? '' : 'disabled'}><span class="lb">Trinken</span></button></div>
      </div>`).join('')}</div>`,
    bottom: bar([{ go: 'hub', icon: '🏠', label: 'Start' }, { go: 'skills', icon: '🎯', label: 'Fähigkeit' }, { go: 'darts', icon: '🛒', label: 'Darts-Shop', wide: true }]),
  });
}

export function mount(root, app) {
  const s = app.state;
  bindHead(root, app, HELP);
  root.querySelectorAll('[data-buy]').forEach(b => b.onclick = () => {
    try { buyDrink(s, b.dataset.buy); app.save(); app.refresh(); } catch (e) { toast(e.message, 'error'); }
  });
  root.querySelectorAll('[data-drink]').forEach(b => b.onclick = () => {
    try {
      const r = drink(s, b.dataset.drink, new RNG(s.rng)); app.save();
      toast(`Prost! Energie ${r.energy} %${r.buzz ? ` · Rausch +${r.buzz}` : ''}${r.rel ? ` · ${relLabel[r.rel]} +1` : ''}`);
      app.refresh();
    } catch (e) { toast(e.message, 'error'); }
  });
}
