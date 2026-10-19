// Training einer Fähigkeit: 20 Level mit je 3 Sternen; Level wählen → Minispiel (kostet 55 % Energie)
import { TRAINABLE, SKILL_LEVELS, skillValue, skillBonus } from '../../../nsd.js';
import { TRAIN_ENERGY, levelPoints, levelOpen, canTrain, startTraining, nextLevel, DECAY_FROM } from '../../../skilltrain.js';
import { frame, header, titleBand, meter, heartIcon, starIcon, bar, bindHead } from '../frame.js';
import { toast, confirmDialog } from '../../components.js';

export const nsd = true;
const HELP = `<p>Jedes Level hat 3 Sterne: Erfolg im 1. Versuch = 3, im 2. = 2, im 3. = 1. Du kannst ein Level beliebig oft spielen, bis es perfekt ist – zählt immer das beste Ergebnis.</p>
  <p>Ein Training kostet ${TRAIN_ENERGY} % Energie. Das nächste Level öffnet sich, sobald du im vorigen mindestens einen Stern hast.</p>
  <p>Ab ${DECAY_FROM} Wochen ohne Training einer Fähigkeit können Sterne verloren gehen.</p>`;

export function render(app, params = {}) {
  const p = app.state.player, key = params.key ?? 'sco', t = TRAINABLE.find(x => x.key === key);
  const e = Math.round(p.energy ?? 100), idx = TRAINABLE.indexOf(t), nl = nextLevel(p, key), b = skillBonus(p, key);
  const tiles = Array.from({ length: SKILL_LEVELS }, (_, i) => {
    const L = i + 1, pts = levelPoints(p, key, L), open = levelOpen(p, key, L);
    return `<button class="nsd-lvl ${open ? '' : 'locked'} ${pts === 3 ? 'perfect' : ''} ${L === nl ? 'next' : ''}" data-l="${L}" ${open && pts < 3 ? '' : 'disabled'}>
      <b>${L}</b><span>${[1, 2, 3].map(k => `<i class="${k <= pts ? '' : 'off'}">${starIcon('', 'xs')}</i>`).join('')}</span></button>`;
  }).join('');
  return frame({
    body: `${header(p.name)}${titleBand(`${t.icon} ${t.label} ${skillValue(p, key)}${b ? ` (+${b})` : ''}`)}
      <div class="nsd-meters one">${meter({ icon: heartIcon(), label: `Energie ${e} %`, pct: e, tone: e >= TRAIN_ENERGY ? 'green' : 'red' })}</div>
      <div class="nsd-pager"><button data-k="${TRAINABLE[(idx + 3) % 4].key}">◀ ${TRAINABLE[(idx + 3) % 4].label}</button><button data-k="${TRAINABLE[(idx + 1) % 4].key}">${TRAINABLE[(idx + 1) % 4].label} ▶</button></div>
      <div class="nsd-lvls">${tiles}</div>
      ${(p.idle?.[key] ?? 0) >= 7 ? `<div class="nsd-warn">⚠️ Seit ${p.idle[key]} Wochen nicht trainiert – Sterne in Gefahr!</div>` : ''}`,
    bottom: bar([{ go: 'skills', icon: '◀', label: 'Zurück' }, { go: 'drinks', icon: '🍺', label: 'Trinken' },
      { id: 't-next', icon: '<span style="color:#2bd33a">➡</span>', label: nl ? `Level ${nl}` : 'Alles perfekt', wide: true, disabled: !nl }]),
  });
}

export function mount(root, app, params = {}) {
  const key = params.key ?? 'sco', s = app.state;
  bindHead(root, app, HELP);
  root.querySelectorAll('[data-k]').forEach(b => b.onclick = () => app.go('trainlevels', { key: b.dataset.k }));
  const go = async L => {
    const c = canTrain(s, key, L);
    if (!c.ok) return toast(c.reason, 'error');
    if (!await confirmDialog(`Level ${L} trainieren?`, `Kostet ${TRAIN_ENERGY} % Energie. Du hast 3 Versuche.`, 'Training starten')) return;
    startTraining(s, key, L); app.save();
    app.go('minigame', { key, level: L, mode: 'train' });
  };
  root.querySelectorAll('[data-l]').forEach(b => b.onclick = () => go(+b.dataset.l));
  root.querySelector('#t-next').onclick = () => { const L = nextLevel(s.player, key); if (L) go(L); };
}
