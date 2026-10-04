// Spielerprofil: Karte, Attribute verteilen, XP, Erfahrung
import { esc, fmtNum, fmtPct } from '../../util.js';
import { nationName } from '../../../data/nations.js';
import { REGIONS } from '../../../data/regions.js';
import { overall, checkoutBase, xpForLevel, expLabel, expNext, EXP_MAX, MAX_LEVEL, pointsForLevel } from '../../player.js';
import { tourStatus } from '../../world.js';
import { momentumState } from '../../form.js';
import { MILESTONES, reached } from '../../milestones.js';
import { topbar, futCard, attrRows, bindRaise } from '../components.js';

// Meilensteine: erreicht (mit Datum) oben, offene mit Bonus-XP
function milestonePanel(s) {
  const got = MILESTONES.filter(m => reached(s, m.id)), open = MILESTONES.filter(m => !reached(s, m.id));
  const row = (m, done) => `<div class="ms-row ${done ? 'done' : ''}"><span>${m.icon}</span><span class="ms-label">${esc(m.label)}</span>
    <span class="${done ? 'muted' : 'cyan'}" style="font-size:.78rem;white-space:nowrap">${done ? `KW ${s.milestones[m.id].week}/${s.milestones[m.id].year}` : `+${m.xp} XP`}</span></div>`;
  return `<div class="panel"><div class="row-between"><h3>🏅 Meilensteine</h3><span class="muted">${got.length}/${MILESTONES.length}</span></div>
    ${got.map(m => row(m, true)).join('')}${open.map(m => row(m, false)).join('')}</div>`;
}

export function render(app) {
  const s = app.state, p = s.player;
  const lv = p.level ?? 1, max = lv >= MAX_LEVEL, need = max ? 1 : xpForLevel(lv);
  const nextExp = expNext(p.exp), ms = momentumState(p);
  const reg = p.region ? ` · ${esc(REGIONS[p.region]?.name ?? '')}` : '';
  return `${topbar({ title: 'Spielerprofil', sub: `${esc(nationName(p.nation))}${reg} · ${p.hand === 'L' ? 'Linkshänder' : 'Rechtshänder'} · ${p.age} Jahre` })}
  <div class="two-col card-left">
    <div class="stack">
      <div class="card-stage">${futCard(p, { me: true })}</div>
      <div class="panel stack">
        <div class="row-between"><span class="label">Level</span><span class="v cyan" style="font-family:var(--font-display);font-style:italic;font-weight:800;font-size:1.6rem">${lv}<span class="muted" style="font-size:.9rem"> / ${MAX_LEVEL}</span></span></div>
        <div class="xp-bar"><i style="width:${max ? 100 : Math.min(100, p.xp / need * 100)}%"></i></div>
        <div class="row-between muted" style="font-size:.8rem"><span>${max ? 'Maximales Level erreicht' : `${fmtNum(p.xp)} / ${fmtNum(need)} XP bis Level ${lv + 1} (+${pointsForLevel(lv + 1)} Punkt${pointsForLevel(lv + 1) > 1 ? 'e' : ''})`}</span><span>Gesamt ${fmtNum(p.xpTotal)} XP</span></div>
      </div>
      <div class="panel stack">
        <div class="row-between"><span class="label">Selbstvertrauen</span><b class="${ms.bonus > 0 ? 'pos' : ms.bonus < 0 ? 'neg' : 'muted'}">${ms.icon} ${ms.label}${ms.bonus ? ` (${ms.bonus > 0 ? '+' : ''}${ms.bonus})` : ''}</b></div>
        <div class="xp-bar momentum"><i style="width:${((p.momentum ?? 0) + 10) * 5}%"></i></div>
        <div class="muted" style="font-size:.8rem">Siege – vor allem gegen Stärkere – geben Schwung, Niederlagen nagen. Ab ±3 wirkt es auf Scoring, Finishing und Fokus. Lokale Turniere zählen wenig.</div>
      </div>
      <div class="panel stack">
        <div class="row-between"><span class="label">Erfahrung</span><span class="v gold" style="font-family:var(--font-display);font-style:italic;font-weight:800;font-size:1.6rem">${expLabel(p.exp)}</span></div>
        <div class="xp-bar"><i style="width:${((p.exp + 4) / (EXP_MAX + 4)) * 100}%"></i></div>
        <div class="muted" style="font-size:.8rem">Skala −4 (Matchdarts wackeln) bis +10 (eiskalt in Entscheidungslegs). Auf der großen Bühne (Majors, World Series, Premier League) und gegen Top-16-Spieler zählt jede Stufe zusätzlich. Wächst mit jedem Match – Entscheidungslegs und große Turniere zählen mehr.${nextExp ? ` Nächste Stufe: ${p.clutch ?? 0} / ${nextExp}.` : ''}</div>
      </div>
    </div>
    <div class="stack">
      <div class="panel">
        <div class="row-between"><h3>Attribute</h3>
          <span class="${p.points ? 'badge badge-green' : 'muted'}">${p.points} Punkt${p.points === 1 ? '' : 'e'} frei</span></div>
        ${attrRows(p)}
        <p class="muted" style="font-size:.78rem;margin-top:10px">Werte 1–100 = „stärker als X von 100 Dartspielern“ (kein Average). Kosten je Stufe: 1 Punkt bis 69 · 2 Punkte 70–84 · 3 Punkte 85–94 · 4 Punkte ab 95. Je Level-Aufstieg gibt es 5 Punkte.</p>
      </div>
      <div class="kpi-grid">
        <div class="kpi"><div class="label">Gesamt</div><div class="v">${overall(p.attrs)}</div></div>
        <div class="kpi"><div class="label">Average (gespielt)</div><div class="v num">${p.avgReal ? fmtNum(p.avgReal, 1) : '–'}</div></div>
        <div class="kpi"><div class="label">Doppel-Basis</div><div class="v num">${fmtPct(checkoutBase(p.attrs), 0)}</div></div>
        <div class="kpi"><div class="label">Status</div><div class="v" style="font-size:1.05rem">${esc(tourStatus(p, s.date.year))}</div></div>
      </div>
      ${milestonePanel(s)}
    </div>
  </div>`;
}

export function mount(root, app) { bindRaise(root, app); }
