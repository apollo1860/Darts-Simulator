// Turnier (Tour-Modus): nächstes Match (Spielen live / Simulieren), Ausgeschieden, Turnierergebnis
import { esc, fmtNum, surname } from '../../../util.js';
import { groupTable } from '../../../bracket.js';
import { flag } from '../../../../data/nations.js';
import { getPlayer } from '../../../world.js';
import { formatLabel } from '../../../matchEngine.js';
import { rankOf } from '../../../rankings.js';
import { playerMatch, playRound, nextRound, simulateRest, closeEvent, placeLabel, nextSub } from '../../../tournaments.js';
import { starPct, starNeed, canSelfPlay, nervesOf, matchEnergy, isFloor } from '../../../nsd.js';
import { starMeter, frame, header, titleBand, darkBar, bar, meter, coin, starIcon, heartIcon, card, bindHead, arrowIcon, checkIcon } from '../frame.js';

export const nsd = true;
const HELP = '<p><b>Spielen</b>: Das Match läuft im DartConnect-Liveticker. Matchdarts, Checks ab 61, Break-Chancen und Entscheidungslegs wirfst du selbst. <b>Simulieren</b>: Ergebnis sofort.</p><p>Unter 20 % Energie wirft die KI für dich – und es wird mit jedem Leg schlechter. Ein Match kostet Energie nach Länge; Floor-Turniere (Players Championships, Qualifier) schlauchen weniger als Bühne (European Tour, Majors, WM).</p><p><b>Nervosität</b> 😰 entsteht gegen Gegner aus den Top 8, auf der großen Bühne und in der Anfängerphase (Status 1–5). Sie mindert Scoring/Finishing/Mental und lässt mit steigendem Status (Mental) nach – ab Mental 50 ist sie weg.</p>';

export const nameOf = (s, id) => s.activeEvent?.teams?.[id]?.name ?? getPlayer(s, id)?.name ?? '?';
const nationOf = (s, id) => (id === 'P' ? s.player.nation : getPlayer(s, id)?.nation);

// Rundenname für schmale Tabellen: „Gruppenphase · Spieltag 2“ → „Gruppe · Sp. 2“
const shortRound = n => n.replace('Gruppenphase', 'Gruppe').replace('Spieltag', 'Sp.');

// Eigene Matches dieses Turniers
function myPath(s, inst) {
  const rows = [];
  for (const r of inst.rounds) {
    const m = r.matches.find(x => (x.a === 'P' || x.b === 'P') && !x.bye && x.winner);
    if (!m) continue;
    const me = m.a === 'P' ? 0 : 1, opp = me ? m.a : m.b, won = m.winner === 'P';
    rows.push(`<tr><td class="rd">${esc(shortRound(r.name))}</td><td class="nm">${flag(nationOf(s, opp))} ${esc(nameOf(s, opp))}</td><td class="c">${m.score[me]}:${m.score[1 - me]}</td><td class="c">${won ? '✔' : '✖'}</td></tr>`);
  }
  return rows.length ? `<table class="nsd-table nsd-path">${rows.join('')}</table>` : '';
}

// Auslosung der aktuellen Runde (Version 94): kompakt und eingeklappt; in Gruppenphasen ◀ ▶ von Gruppe zu Gruppe
const draw = { key: null, gi: 0, open: false };
const gName = gi => (gi < 26 ? String.fromCharCode(65 + gi) : `${gi + 1}`);
const short = (s, id) => (s.activeEvent?.teams?.[id] ? nameOf(s, id) : id === 'P' ? s.player.name : surname(nameOf(s, id)));
function drawLine(s, m) {
  const me = m.a === 'P' || m.b === 'P' || s.activeEvent?.teams?.[m.a]?.members?.includes('P') || s.activeEvent?.teams?.[m.b]?.members?.includes('P');
  if (m.bye || !m.b) return `<div class="dl${me ? ' me' : ''}"><span class="l">${flag(nationOf(s, m.a))} ${esc(short(s, m.a))}</span><span class="x">Freilos</span><span class="r"></span></div>`;
  const w = id => (m.winner === id ? ' w' : '');
  return `<div class="dl${me ? ' me' : ''}"><span class="l${w(m.a)}">${flag(nationOf(s, m.a))} ${esc(short(s, m.a))}</span>
    <span class="x">${m.winner && m.score ? `${m.score[0]}:${m.score[1]}` : '–'}</span><span class="r${w(m.b)}">${esc(short(s, m.b))} ${flag(nationOf(s, m.b))}</span></div>`;
}
function drawBody(s, inst) {
  const round = inst.rounds[inst.current];
  if (!(round.isGroup && inst.groups)) return round.matches.map(m => drawLine(s, m)).join('');
  const gi = draw.gi, g = inst.groups[gi] ?? [], tab = groupTable(inst.rounds, g, gi);
  return `<div class="dnav"><button class="nsd-btn sm" data-dg="-1">◀</button><b>Gruppe ${gName(gi)}</b><span class="n">${gi + 1}/${inst.groups.length}</span><button class="nsd-btn sm" data-dg="1">▶</button></div>
    <div class="dtab">${tab.map((t, i) => `<div class="dt${t.id === 'P' ? ' me' : ''}"><span class="pos">${i + 1}</span><span class="nm">${flag(nationOf(s, t.id))} ${esc(short(s, t.id))}</span><span>${t.w}-${t.l}</span><span>${t.lf - t.la >= 0 ? '+' : ''}${t.lf - t.la}</span></div>`).join('')}</div>
    ${round.matches.filter(m => m.group === gi).map(m => drawLine(s, m)).join('')}`;
}
function drawView(s, inst) {
  const round = inst.rounds[inst.current];
  if (!round?.matches?.length) return '';
  const key = `${inst.eventId}|${inst.year}|${inst.sub ?? ''}`;
  if (draw.key !== key) {                                       // neues Turnier: eigene Gruppe vorauswählen, eingeklappt
    const mine = inst.groups?.findIndex(g => g.includes('P') || g.some(id => inst.teams?.[id]?.members?.includes('P')));
    Object.assign(draw, { key, gi: Math.max(0, mine ?? 0), open: false });
  }
  const label = round.isGroup && inst.groups ? `${inst.groups.length} Gruppen` : `${round.matches.length} Spiele`;
  return `<details class="nsd-draw"${draw.open ? ' open' : ''}><summary>📋 Auslosung · ${esc(shortRound(round.name))} <span class="n">${label}</span></summary>
    <div class="nsd-draw-body">${drawBody(s, inst)}</div></details>`;
}
function bindDraw(root, s) {
  const d = root.querySelector('.nsd-draw');
  if (!d) return;
  d.addEventListener('toggle', () => { draw.open = d.open; });
  d.addEventListener('click', ev => {
    const b = ev.target.closest('[data-dg]');
    if (!b) return;
    const n = s.activeEvent.groups.length;
    draw.gi = (draw.gi + Number(b.dataset.dg) + n) % n;
    d.querySelector('.nsd-draw-body').innerHTML = drawBody(s, s.activeEvent);
  });
}

function versus(s, inst, m) {
  const oppId = m.a === 'P' ? m.b : m.a, opp = getPlayer(s, oppId), p = s.player;
  const r = rankOf(s, 'pdc', oppId), mine = rankOf(s, 'pdc', 'P');
  const nv = nervesOf(p, inst, oppId), f = inst.rounds[inst.current]?.format ?? {}, cost = matchEnergy(Math.round((f.legs ?? 3) * (f.sets ?? 1) * 1.6), inst);
  return `<div class="nsd-vs">
    <div class="nsd-vs-side me"><div class="fl">${flag(p.nation)}</div><div class="nm">${esc(p.name)}</div>
      <div class="dt">${starIcon(p.star.level, 'sm')} Status · OOM ${mine ?? '–'}</div></div>
    <div class="nsd-vs-x">VS</div>
    <div class="nsd-vs-side"><div class="fl">${flag(nationOf(s, oppId))}</div><div class="nm">${esc(nameOf(s, oppId))}</div>
      <div class="dt">OOM ${r ?? '–'}</div><div class="dt">Ø ${Math.round((opp?.avg ?? 0) * 0.85)}–${Math.round((opp?.avg ?? 0) * 1.15)}</div></div>
  </div>
  <div class="nsd-vs-info">⚡ Match kostet ca. ${cost} % Energie (${isFloor(inst) ? 'Floor' : 'Bühne'})${nv.pts ? `<br><span class="neg">😰 Nervosität −${nv.pts.toFixed(1).replace('.', ',')}: ${nv.parts.map(x => x.label).join(', ')} – Mental (Star-Status) baut sie ab</span>` : ''}</div>`;
}

export function render(app) {
  const s = app.state, inst = s.activeEvent, p = s.player;
  if (!inst) return card('Kein laufendes Turnier.', { okId: 'e-home' });
  const pm = playerMatch(inst), e = Math.round(p.energy ?? 100);
  const energy = meter({ icon: heartIcon(), label: `Energie ${e} %`, pct: e, tone: canSelfPlay(p) ? 'green' : 'red' });
  const head = `${header(p.name)}${titleBand(esc(inst.name))}`;
  if (inst.done) {
    const win = inst.place === 'W';
    return frame({
      body: `${head}${darkBar(win ? '🏆 TURNIERSIEG!' : esc(placeLabel(inst.place, inst.cat, inst.eventId)), win ? '' : 'sm')}
        <div class="nsd-result">
          <div class="nsd-result-row"><span>Preisgeld</span><b>${coin(inst.stars ?? 0)}</b></div>
          <div class="nsd-result-row"><span>Star-Status</span><b>${(inst.star ?? 0) >= 0 ? '+' : ''}${fmtNum(inst.star ?? 0, 1)}</b></div>
          ${starMeter(app.state, { starIcon, starPct, starNeed })}
          ${energy}
        </div>${myPath(s, inst)}`,
      bottom: bar([null, null, inst.hasNext ? { id: 'e-nextsub', icon: arrowIcon(), label: 'Nächstes Turnier', wide: true }
        : { id: 'e-close', icon: checkIcon(), wide: true }]),
    });
  }
  if (pm && !pm.winner) {
    const round = inst.rounds[inst.current], lm = inst.live?.m;
    return frame({
      body: `${head}${darkBar(`${esc(round.name)} · ${formatLabel(round.format)}`, 'sm')}
        ${versus(s, inst, pm)}${drawView(s, inst)}
        <div class="nsd-result">${energy}
          ${canSelfPlay(p) ? '' : '<div class="nsd-warn">Nicht match-fit: Die KI wirft für dich und baut Leg für Leg ab.</div>'}
          ${lm ? `<div class="nsd-warn ok">Laufendes Match: ${lm.format.sets ? `Sätze ${lm.sets[inst.live.me]}:${lm.sets[1 - inst.live.me]} · ` : ''}Legs ${lm.legs[inst.live.me]}:${lm.legs[1 - inst.live.me]}</div>` : ''}
        </div>${myPath(s, inst)}`,
      bottom: bar([{ go: 'hub', icon: '🏠', label: 'Start' }, { id: 'e-sim', icon: '⚡', label: 'Simulieren' },
        { go: 'live', icon: arrowIcon(), label: lm ? 'Weiterspielen' : 'Spielen', wide: true }]),
    });
  }
  const lm = inst.lastMatch;
  return frame({
    body: `${head}${darkBar('Ausgeschieden', 'sm red')}
      <div class="nsd-card" style="font-size:1.3rem">${lm ? `${esc(lm.round)}: ${lm.score.join(':')} gegen ${esc(nameOf(s, lm.opp))}` : ''}</div>${myPath(s, inst)}`,
    bottom: bar([{ go: 'hub', icon: '🏠', label: 'Start' }, null, { id: 'e-rest', icon: '⏩', label: 'Turnier beenden', wide: true }]),
  });
}

export function mount(root, app) {
  bindHead(root, app, HELP);
  const s = app.state, on = (id, fn) => { const b = root.querySelector(id); if (b) b.onclick = fn; };
  on('#e-home', () => app.go('hub'));
  bindDraw(root, s);
  on('#e-sim', () => { s.activeEvent.live = null; playRound(s); nextRound(s); app.save(); app.go('matchstats'); });
  on('#e-rest', () => { simulateRest(s); app.save(); app.refresh(); });
  on('#e-nextsub', () => { nextSub(s); app.save(); app.refresh(); });
  on('#e-close', () => {
    closeEvent(s); app.save();
    if (s.interview) return app.go('interview');
    app.go(s.articles?.length ? 'news' : 'hub', { article: true });
  });
}
