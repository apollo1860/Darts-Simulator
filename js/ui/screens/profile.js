// Spielerprofil: Karte, Attribute verteilen, XP, Erfahrung
import { esc, fmtNum, fmtPct } from '../../util.js';
import { nationName } from '../../../data/nations.js';
import { REGIONS } from '../../../data/regions.js';
import { overall, checkoutBase, xpForNextPoint, expLabel, expNext, EXP_MAX } from '../../player.js';
import { tourStatus } from '../../world.js';
import { topbar, futCard, attrRows, bindRaise } from '../components.js';

export function render(app) {
  const s = app.state, p = s.player;
  const need = xpForNextPoint(p.pointsEarned);
  const nextExp = expNext(p.exp);
  const reg = p.region ? ` · ${esc(REGIONS[p.region]?.name ?? '')}` : '';
  return `${topbar({ title: 'Spielerprofil', sub: `${esc(nationName(p.nation))}${reg} · ${p.hand === 'L' ? 'Linkshänder' : 'Rechtshänder'} · ${p.age} Jahre` })}
  <div class="two-col card-left">
    <div class="stack">
      <div class="card-stage">${futCard(p, { me: true })}</div>
      <div class="panel stack">
        <div class="row-between"><span class="label">Trainingspunkte (XP)</span><span class="num">${p.xp} / ${need} XP</span></div>
        <div class="xp-bar"><i style="width:${Math.min(100, p.xp / need * 100)}%"></i></div>
        <div class="muted" style="font-size:.8rem">Gesamt ${fmtNum(p.xpTotal)} XP · ${p.pointsEarned} Punkte verdient</div>
      </div>
      <div class="panel stack">
        <div class="row-between"><span class="label">Erfahrung</span><span class="v gold" style="font-family:var(--font-display);font-style:italic;font-weight:800;font-size:1.6rem">${expLabel(p.exp)}</span></div>
        <div class="xp-bar"><i style="width:${((p.exp + 4) / (EXP_MAX + 4)) * 100}%"></i></div>
        <div class="muted" style="font-size:.8rem">Skala −4 (Matchdarts wackeln) bis +10 (eiskalt in Entscheidungslegs). Wächst mit jedem Match – Entscheidungslegs und große Turniere zählen mehr.${nextExp ? ` Nächste Stufe: ${p.clutch ?? 0} / ${nextExp}.` : ''}</div>
      </div>
    </div>
    <div class="stack">
      <div class="panel">
        <div class="row-between"><h3>Attribute</h3>
          <span class="${p.points ? 'badge badge-green' : 'muted'}">${p.points} Punkt${p.points === 1 ? '' : 'e'} frei</span></div>
        ${attrRows(p)}
        <p class="muted" style="font-size:.78rem;margin-top:10px">Werte 1–100 = „stärker als X von 100 Dartspielern“ (kein Average). Kosten je Stufe: 1 Punkt bis 69 · 2 Punkte 70–94 · 3 Punkte ab 95.</p>
      </div>
      <div class="kpi-grid">
        <div class="kpi"><div class="label">Gesamt</div><div class="v">${overall(p.attrs)}</div></div>
        <div class="kpi"><div class="label">Average (gespielt)</div><div class="v num">${p.avgReal ? fmtNum(p.avgReal, 1) : '–'}</div></div>
        <div class="kpi"><div class="label">Doppel-Basis</div><div class="v num">${fmtPct(checkoutBase(p.attrs), 0)}</div></div>
        <div class="kpi"><div class="label">Status</div><div class="v" style="font-size:1.05rem">${esc(tourStatus(p, s.date.year))}</div></div>
      </div>
    </div>
  </div>`;
}

export function mount(root, app) { bindRaise(root, app); }
