// Version 230: Getränke-Bonus wählen (Vorlage NSS „Beziehungsbonus wählen“) – Weinschorle: +1 Fähigkeitspunkt, Schnaps: +4–5 Beziehung (dauerhaft)
import { esc } from '../../../util.js';
import { relLabelOf } from '../../../nsd.js';
import { drinkBonusOptions, applyDrinkBonus } from '../../../skilltrain.js';
import { RNG } from '../../../rng.js';
import { frame, titleBand, meter, checkIcon } from '../frame.js';
import { toast } from '../../components.js';

export const nsd = true;
const nameOf = (s, o, kind) => kind === 'skill' ? `${o.label} ${o.value}` : o.key === 'partner' && s.player.partnerName && !s.player.married ? esc(s.player.partnerName) : relLabelOf(s.player, o.key);

export function render(app) {
  const s = app.state, kind = s.player.drinkBonus;
  if (!kind) return frame({ body: titleBand('Bonus'), bottom: '' });
  const opts = drinkBonusOptions(s, kind);
  return frame({
    bg: 'green',
    body: `${titleBand(`<span style="font-size:.8em">${kind === 'skill' ? 'Fähigkeitsbonus wählen' : 'Beziehungsbonus wählen'}</span>`)}
      <div class="nsd-list nsd-dbonus">${opts.map(o => `<div class="nsd-line">
        ${meter({ label: nameOf(s, o, kind), pct: o.pct, tone: o.pct > 0 || o.ok ? 'green' : 'grey' })}
        <button class="nsd-btn" data-k="${o.key}" ${o.ok ? '' : 'disabled'}>${checkIcon()}</button>
      </div>`).join('')}</div>`,
    bottom: '',
  });
}
export function mount(root, app, params = {}) {
  const s = app.state, back = params.back ?? 'drinks';
  if (!s.player.drinkBonus) return void setTimeout(() => app.go(back), 0);
  root.querySelectorAll('[data-k]').forEach(b => b.onclick = () => {
    try {
      const r = applyDrinkBonus(s, b.dataset.k, new RNG(s.rng)); app.save();
      toast(r.kind === 'skill' ? `${b.closest('.nsd-line').querySelector('.lb').textContent.replace(/\s\d+$/, '')} +1 (jetzt ${r.value})` : `${relLabelOf(s.player, r.key)} +${r.n}`, 'success');
      app.go(back);
    } catch (e) { toast(e.message, 'error'); }
  });
}
