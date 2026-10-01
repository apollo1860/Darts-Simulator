// Turnier-Screen: eigenes Match (Vorschau + Simulation), Bracket, Abschluss
import { esc, fmtEUR, fmtNum, fmtPct } from '../../util.js';
import { flag } from '../../../data/nations.js';
import { getPlayer } from '../../world.js';
import { formatLabel } from '../../matchEngine.js';
import { playerMatch, playRound, nextRound, simulateRest, closeEvent, placeLabel } from '../../tournaments.js';
import { MANUAL_AVAILABLE } from '../../matchUI.js';
import { topbar, futCard, modal, catTag, playerModal } from '../components.js';

const nm = (s, id) => getPlayer(s, id).name;

function bracket(s, inst) {
  return `<div class="bracket-scroll"><div class="bracket">${inst.rounds.map((r, ri) => `
    <div class="bracket-col"><h4 class="h-display">${esc(r.name)}</h4>
    ${(r.matches.length ? r.matches : Array.from({ length: inst.rounds[0].matches.length >> ri }, () => null)).map(m => {
      if (!m) return '<div class="b-match"><div class="b-line dim"><span class="nm">–</span></div><div class="b-line dim"><span class="nm">–</span></div></div>';
      const mine = m.a === 'P' || m.b === 'P';
      const line = (id, i) => {
        const cls = [m.winner ? (m.winner === id ? 'win' : 'lose') : '', id === 'P' ? 'me' : ''].join(' ');
        return `<div class="b-line ${cls}" data-pl="${id}"><span class="nm">${flag(getPlayer(s, id).nation)} ${esc(nm(s, id))}</span><span class="sc">${m.score ? m.score[i] : ''}</span></div>`;
      };
      return `<div class="b-match ${mine ? 'mine' : ''}">${line(m.a, 0)}${line(m.b, 1)}</div>`;
    }).join('')}</div>`).join('')}
  </div></div>`;
}

function matchPanel(s, inst) {
  const m = playerMatch(inst);
  const round = inst.rounds[inst.current];
  const oppId = m.a === 'P' ? m.b : m.a, opp = getPlayer(s, oppId);
  return `<div class="panel stack">
    <div class="row-between"><div><div class="label">${esc(round.name)}</div><h3>Dein Match</h3></div>
      <span class="tag tag-pc">${formatLabel(round.format)}</span></div>
    <div class="versus">${futCard(s.player, { small: true, me: true })}<div class="vs">VS</div><div data-pl="${oppId}" style="cursor:pointer">${futCard(opp, { small: true })}</div></div>
    <div class="row" style="justify-content:center">
      ${inst.live ? `<button class="btn btn-gold btn-continue" data-go="match">Match fortsetzen ▸</button>`
        : `<button class="btn btn-gold" data-go="match" ${MANUAL_AVAILABLE ? '' : 'disabled'}>🎯 Selbst spielen</button>
      <button class="btn btn-primary btn-continue" id="btn-sim">Simulieren ▸</button>`}
    </div>
    ${inst.live ? `<p class="muted center" style="font-size:.82rem;margin:0">Laufendes Match: ${inst.live.m.format.sets ? `Sätze ${inst.live.m.sets.join(':')} · ` : ''}Legs ${inst.live.m.legs.join(':')}</p>` : ''}
  </div>`;
}

function outPanel(inst) {
  const lm = inst.lastMatch;
  return `<div class="panel stack center">
    <h3>Ausgeschieden</h3>
    <p class="muted">${lm ? `${esc(lm.round)} · ${lm.score.join(':')}` : ''}</p>
    <button class="btn btn-primary btn-continue" id="btn-rest">Turnier zu Ende simulieren ▸</button>
  </div>`;
}

function donePanel(s, inst) {
  const win = inst.place === 'W';
  return `<div class="panel stack center">
    <div class="label">Turnier beendet</div>
    <h2 class="${win ? 'gold' : ''}">${win ? '🏆 Turniersieg!' : placeLabel(inst.place)}</h2>
    <div class="kpi-grid" style="text-align:left">
      <div class="kpi"><div class="label">Preisgeld</div><div class="v gold num">${fmtEUR(inst.prize)}</div></div>
      <div class="kpi"><div class="label">Erfahrung</div><div class="v cyan num">+${inst.xp} XP</div></div>
      <div class="kpi"><div class="label">Sieger</div><div class="v" style="font-size:1.1rem">${flag(getPlayer(s, inst.winner).nation)} ${esc(nm(s, inst.winner))}</div></div>
      <div class="kpi"><div class="label">Kontostand</div><div class="v num">${fmtEUR(s.finance.balance)}</div></div>
    </div>
    <button class="btn btn-primary btn-continue" id="btn-close">Zurück zum Hub ▸</button>
  </div>`;
}

export function render(app) {
  const s = app.state, inst = s.activeEvent;
  if (!inst) return `${topbar({ title: 'Turnier' })}<div class="panel">Kein laufendes Turnier.</div>`;
  const body = inst.done ? donePanel(s, inst) : inst.playerAlive ? matchPanel(s, inst) : outPanel(inst);
  return `${topbar({ title: inst.name, sub: `${catTag(inst.cat)} ${esc(inst.city)} · Sieger ${fmtEUR(inst.prizes.W ?? 0)}`, back: 'hub' })}
    <div class="stack">${body}
    <div class="section-title"><span class="label">Turnierbaum</span></div>
    <div class="panel">${bracket(s, inst)}</div></div>`;
}

function resultModal(s, res, onClose) {
  const lm = s.activeEvent.lastMatch;
  const opp = getPlayer(s, lm.opp);
  const a = lm.me, b = lm.opp_;
  const row = (label, va, vb, fmt = v => v, higher = true) => {
    const better = va === vb ? 0 : (va > vb) === higher ? 1 : -1;
    return `<tr><td class="${better > 0 ? 'better' : ''}">${fmt(va)}</td><td>${label}</td><td class="${better < 0 ? 'better' : ''}">${fmt(vb)}</td></tr>`;
  };
  modal({
    title: lm.won ? 'Sieg!' : 'Niederlage',
    dismissable: false,
    body: `<div class="label center">${esc(lm.round)}</div>
      <div class="scoreline"><span class="nm">${esc(s.player.name)}</span>
      <span class="big ${lm.won ? 'pos' : 'neg'}">${lm.score[0]}:${lm.score[1]}</span>
      <span class="nm">${esc(opp.name)}</span></div>
      <table class="stat-compare">
        ${row('Average', a.avg, b.avg, v => fmtNum(v, 2))}
        ${row('180er', a.s180, b.s180)}
        ${row('140+', a.s140, b.s140)}
        ${row('100+', a.s100, b.s100)}
        ${row('Checkout', a.coPct, b.coPct, v => fmtPct(v))}
        ${row('Doppel', `${a.coHit}/${a.coAtt}`, `${b.coHit}/${b.coAtt}`, v => v, true).replace(/class="better"/g, '')}
        ${row('High Finish', a.hiFinish, b.hiFinish, v => v || '–')}
        ${row('Bestes Leg', a.bestLeg || 99, b.bestLeg || 99, v => (v === 99 ? '–' : `${v} Darts`), false)}
      </table>
      <p class="center cyan" style="margin-top:12px;font-weight:700">+${lm.xp} XP</p>`,
    actions: [{ label: 'Weiter', cls: 'btn-primary', onClick: onClose }],
  });
}

export function mount(root, app, params = {}) {
  const s = app.state;
  if (params.showResult && s.activeEvent?.lastMatch) {
    params.showResult = false;
    resultModal(s, null, () => app.refresh());
  }
  root.querySelectorAll('[data-pl]').forEach(el => el.onclick = () => {
    const id = el.dataset.pl;
    playerModal(getPlayer(s, id), id === 'P');
  });
  root.querySelector('#btn-sim')?.addEventListener('click', () => {
    const res = playRound(s);
    nextRound(s);
    app.save();
    resultModal(s, res, () => app.refresh());
  });
  root.querySelector('#btn-rest')?.addEventListener('click', () => {
    simulateRest(s); app.save(); app.refresh();
  });
  root.querySelector('#btn-close')?.addEventListener('click', () => {
    closeEvent(s); app.save(); app.go('hub');
  });
}
