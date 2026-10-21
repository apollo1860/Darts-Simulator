// Turnier (Tour-Modus): nächstes Match (Spielen live / Simulieren), Ausgeschieden, Turnierergebnis
import { esc, fmtNum } from '../../../util.js';
import { flag } from '../../../../data/nations.js';
import { getPlayer } from '../../../world.js';
import { formatLabel } from '../../../matchEngine.js';
import { rankOf } from '../../../rankings.js';
import { playerMatch, playRound, nextRound, simulateRest, closeEvent, placeLabel, nextSub } from '../../../tournaments.js';
import { starPct, starNeed, canSelfPlay } from '../../../nsd.js';
import { starMeter, frame, header, titleBand, darkBar, bar, meter, coin, starIcon, heartIcon, card, bindHead, arrowIcon, checkIcon } from '../frame.js';

export const nsd = true;
const HELP = '<p><b>Spielen</b>: Das Match läuft im DartConnect-Liveticker. Matchdarts, Checks ab 61, Break-Chancen und Entscheidungslegs wirfst du selbst. <b>Simulieren</b>: Ergebnis sofort.</p><p>Unter 20 % Energie wirft die KI für dich – und es wird mit jedem Leg schlechter.</p>';

export const nameOf = (s, id) => s.activeEvent?.teams?.[id]?.name ?? getPlayer(s, id)?.name ?? '?';
const nationOf = (s, id) => (id === 'P' ? s.player.nation : getPlayer(s, id)?.nation);

// Eigene Matches dieses Turniers
function myPath(s, inst) {
  const rows = [];
  for (const r of inst.rounds) {
    const m = r.matches.find(x => (x.a === 'P' || x.b === 'P') && !x.bye && x.winner);
    if (!m) continue;
    const me = m.a === 'P' ? 0 : 1, opp = me ? m.a : m.b, won = m.winner === 'P';
    rows.push(`<tr><td>${esc(r.name)}</td><td class="nm">${flag(nationOf(s, opp))} ${esc(nameOf(s, opp))}</td><td class="c">${m.score[me]}:${m.score[1 - me]}</td><td class="c">${won ? '✔' : '✖'}</td></tr>`);
  }
  return rows.length ? `<table class="nsd-table nsd-path">${rows.join('')}</table>` : '';
}

function versus(s, inst, m) {
  const oppId = m.a === 'P' ? m.b : m.a, opp = getPlayer(s, oppId), p = s.player;
  const r = rankOf(s, 'pdc', oppId), mine = rankOf(s, 'pdc', 'P');
  return `<div class="nsd-vs">
    <div class="nsd-vs-side me"><div class="fl">${flag(p.nation)}</div><div class="nm">${esc(p.name)}</div>
      <div class="dt">${starIcon(p.star.level, 'sm')} Status · OOM ${mine ?? '–'}</div></div>
    <div class="nsd-vs-x">VS</div>
    <div class="nsd-vs-side"><div class="fl">${flag(nationOf(s, oppId))}</div><div class="nm">${esc(nameOf(s, oppId))}</div>
      <div class="dt">OOM ${r ?? '–'}</div><div class="dt">Ø ${Math.round((opp?.avg ?? 0) * 0.85)}–${Math.round((opp?.avg ?? 0) * 1.15)}</div></div>
  </div>`;
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
      body: `${head}${darkBar(win ? '🏆 TURNIERSIEG!' : esc(placeLabel(inst.place)), win ? '' : 'sm')}
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
        ${versus(s, inst, pm)}
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
  on('#e-sim', () => { s.activeEvent.live = null; playRound(s); nextRound(s); app.save(); app.go('matchstats'); });
  on('#e-rest', () => { simulateRest(s); app.save(); app.refresh(); });
  on('#e-nextsub', () => { nextSub(s); app.save(); app.refresh(); });
  on('#e-close', () => {
    closeEvent(s); app.save();
    if (s.interview) return app.go('interview');
    app.go(s.articles?.length ? 'news' : 'hub', { article: true });
  });
}
