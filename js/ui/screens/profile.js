// Spielerprofil: Karte, Attribute verteilen, XP
import { esc, fmtNum, fmtPct } from '../../util.js';
import { nationName } from '../../../data/nations.js';
import { ATTRS, overall, targetAverage, checkoutBase, xpForNextPoint, attrCost, raiseAttr } from '../../player.js';
import { tourStatus } from '../../world.js';
import { topbar, futCard } from '../components.js';

export function render(app) {
  const p = app.state.player;
  const need = xpForNextPoint(p.pointsEarned);
  return `${topbar({ title: 'Spielerprofil', sub: `${esc(nationName(p.nation))} · ${p.hand === 'L' ? 'Linkshänder' : 'Rechtshänder'} · ${p.age} Jahre` })}
  <div class="two-col card-left">
    <div class="stack">
      <div class="card-stage">${futCard(p, { me: true })}</div>
      <div class="panel stack">
        <div class="row-between"><span class="label">Erfahrung</span><span class="num">${p.xp} / ${need} XP</span></div>
        <div class="xp-bar"><i style="width:${Math.min(100, p.xp / need * 100)}%"></i></div>
        <div class="muted" style="font-size:.8rem">Gesamt ${fmtNum(p.xpTotal)} XP · ${p.pointsEarned} Punkte verdient</div>
      </div>
    </div>
    <div class="stack">
      <div class="panel">
        <div class="row-between"><h3>Attribute</h3>
          <span class="${p.points ? 'badge badge-green' : 'muted'}">${p.points} Punkt${p.points === 1 ? '' : 'e'} frei</span></div>
        ${ATTRS.map(a => {
          const v = p.attrs[a.key], c = attrCost(v);
          return `<div class="attr-row">
            <div><div class="attr-name">${a.label} <span class="dim" style="font-size:.75rem">${a.short}</span></div>
              <div class="attr-bar"><i style="width:${v}%"></i></div></div>
            <div class="attr-val">${v}</div>
            <button class="icon-btn" data-raise="${a.key}" ${p.points < c || v >= 99 ? 'disabled' : ''} title="Kosten: ${c} Punkt${c > 1 ? 'e' : ''}">+</button>
          </div>`;
        }).join('')}
        <p class="muted" style="font-size:.78rem;margin-top:10px">Kosten je Stufe: 1 Punkt bis 59 · 2 Punkte 60–79 · 3 Punkte ab 80.</p>
      </div>
      <div class="kpi-grid">
        <div class="kpi"><div class="label">Gesamt</div><div class="v">${overall(p.attrs)}</div></div>
        <div class="kpi"><div class="label">Ziel-Average</div><div class="v num">${fmtNum(targetAverage(p.attrs), 1)}</div></div>
        <div class="kpi"><div class="label">Doppel-Basis</div><div class="v num">${fmtPct(checkoutBase(p.attrs), 0)}</div></div>
        <div class="kpi"><div class="label">Status</div><div class="v" style="font-size:1.05rem">${esc(tourStatus(p))}</div></div>
      </div>
    </div>
  </div>`;
}

export function mount(root, app) {
  root.querySelectorAll('[data-raise]').forEach(b => b.onclick = () => {
    if (raiseAttr(app.state.player, b.dataset.raise)) { app.save(); app.refresh(); }
  });
}
