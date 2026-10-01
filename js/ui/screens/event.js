// Turnier-Screen: eigenes Match (Vorschau + Simulation), Bracket, Abschluss
import { esc, fmtEUR, fmtNum, fmtPct } from '../../util.js';
import { flag } from '../../../data/nations.js';
import { getPlayer } from '../../world.js';
import { formatLabel } from '../../matchEngine.js';
import { playerMatch, playRound, nextRound, simulateRest, closeEvent, placeLabel, nextSub } from '../../tournaments.js';
import { MANUAL_AVAILABLE } from '../../matchUI.js';
import { topbar, futCard, modal, catTag, playerModal, attrRows, bindRaise } from '../components.js';
import { expLabel } from '../../player.js';
import { interviewPanel, bindInterview } from '../interview.js';
import { levelBar } from '../level.js';
import { groupTable, GROUP_NAMES } from '../../bracket.js';

// Name (World Cup: Teamname; eigenes Team mit Hinweis)
const nm = (s, id) => {
  const t = s.activeEvent?.teams?.[id];
  if (t) return id === 'P' ? `${t.name} (mit dir)` : t.name;
  return getPlayer(s, id)?.name ?? '?';
};

// Baum ab den letzten 32 (große Felder werden gekürzt)
function bracket(s, inst) {
  let shown = inst.rounds.filter(r => r.remaining <= 32 && !r.isGroup);
  if (!shown.length) shown = inst.rounds.slice(-1);            // z. B. ET-Qualifikation (endet bei 32)
  return `<div class="bracket-scroll"><div class="bracket">${shown.map(r => `
    <div class="bracket-col"><h4 class="h-display">${esc(r.name)}</h4>
    ${(r.matches.length ? r.matches : Array.from({ length: r.remaining / 2 }, () => null)).map(m => {
      if (!m) return '<div class="b-match"><div class="b-line dim"><span class="nm">–</span></div><div class="b-line dim"><span class="nm">–</span></div></div>';
      if (m.bye) return `<div class="b-match"><div class="b-line win"><span class="nm">${flag(getPlayer(s, m.a).nation)} ${esc(nm(s, m.a))}</span></div><div class="b-line dim"><span class="nm">Freilos</span></div></div>`;
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
      ${inst.live ? `<button class="btn btn-primary" data-go="watch">📺 Weiter zuschauen</button>
      ${MANUAL_AVAILABLE ? '<button class="btn btn-gold" data-go="match">🎯 Selbst weiterspielen</button>' : ''}`
        : `${MANUAL_AVAILABLE ? '<button class="btn btn-gold" data-go="match">🎯 Selbst spielen</button>' : ''}
      <button class="btn btn-gold" data-go="watch">📺 DartConnect</button>
      <button class="btn btn-primary" id="btn-sim">⚡ Schnellsimulation</button>`}
    </div>
    <p class="muted center" style="font-size:.78rem;margin:0">${inst.live ? '' : 'DartConnect: Aufnahme für Aufnahme mitverfolgen – mit Entscheidungen bei Störmomenten. Schnellsimulation: Ergebnis sofort.'}</p>
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

// Eigene Matches dieses Turniers
function myPath(s, inst) {
  const rows = [];
  for (const r of inst.rounds) {
    const m = r.matches.find(x => (x.a === 'P' || x.b === 'P') && !x.bye && x.winner);
    if (!m) continue;
    const me = m.a === 'P' ? 0 : 1, opp = me ? m.a : m.b;
    rows.push(`<tr><td class="muted">${esc(r.name)}</td><td>${flag(getPlayer(s, opp).nation)} ${esc(nm(s, opp))}</td>
      <td class="r num ${m.winner === 'P' ? 'pos' : 'neg'}">${m.score[me]}:${m.score[1 - me]}</td></tr>`);
  }
  return rows.length ? `<div class="section-title"><span class="label">Dein Weg</span></div><div class="panel table-wrap"><table class="table">${rows.join('')}</table></div>` : '';
}

// Grand Slam: Gruppentabellen (eigene Gruppe zuerst)
function groupTables(s, inst) {
  if (!inst.groups) return '';
  const order = inst.groups.map((g, gi) => gi).sort((a, b) => (inst.groups[b].includes('P') ? 1 : 0) - (inst.groups[a].includes('P') ? 1 : 0));
  return `<div class="section-title"><span class="label">Gruppen</span></div><div class="group-grid">${order.map(gi => {
    const rows = groupTable(inst.rounds, inst.groups[gi], gi);
    return `<div class="panel" style="padding:10px 12px"><h4 class="cyan">Gruppe ${GROUP_NAMES[gi]}</h4><table class="table">
      <tr><th>Spieler</th><th class="r">S-N</th><th class="r">Legs</th><th class="r">P</th></tr>
      ${rows.map((r, i) => `<tr class="${r.id === 'P' ? 'me' : ''} ${i === 1 ? 'cut' : ''}"><td>${flag(getPlayer(s, r.id).nation)} ${esc(nm(s, r.id))}</td>
        <td class="r num">${r.w}-${r.l}</td><td class="r num">${r.lf}:${r.la}</td><td class="r num"><b>${r.p}</b></td></tr>`).join('')}
    </table></div>`;
  }).join('')}</div>`;
}

// Training direkt nach dem Turnier: verdiente Punkte sofort verteilen
function trainingPanel(s, inst) {
  const p = s.player;
  if (!p.points) return '';
  return `<div class="panel">
    <div class="row-between"><h3>🏋️ Training</h3><span class="badge badge-green">${p.points} Punkt${p.points === 1 ? '' : 'e'} frei</span></div>
    <p class="muted" style="font-size:.84rem;margin:6px 0 0">Nach dem Turnier kannst du dich verbessern. Erfahrung: <b class="gold">${expLabel(p.exp)}</b>${inst.clutch ? ` (+${inst.clutch} Clutch-Punkte in diesem Turnier)` : ''}.</p>
    ${attrRows(p)}
  </div>`;
}

// Konfetti bei Titel / Tourcard
function confetti() {
  const cols = ['#22e4ff', '#3dff9a', '#ffc83d', '#ff4d6d', '#9b6bff'];
  return `<div class="confetti" aria-hidden="true">${Array.from({ length: 40 }, (_, i) =>
    `<i style="--x:${(i * 37) % 100}%;--d:${(i % 7) * 0.12}s;--r:${(i * 53) % 360}deg;background:${cols[i % cols.length]}"></i>`).join('')}</div>`;
}

function donePanel(s, inst) {
  const win = inst.place === 'W', card = inst.place === 'CARD', qual = inst.place === 'QUAL';
  const winnerKpi = inst.winner
    ? `<div class="kpi"><div class="label">Sieger</div><div class="v" style="font-size:1.1rem">${flag(getPlayer(s, inst.winner).nation)} ${esc(nm(s, inst.winner))}</div></div>`
    : inst.cards ? `<div class="kpi"><div class="label">Tourcards</div><div style="font-size:.85rem;font-weight:700">${inst.survivors.map(id => esc(nm(s, id))).join(', ')}</div></div>`
    : `<div class="kpi"><div class="label">Hauptfeld</div><div class="v" style="font-size:1.1rem">${inst.survivors.length} Qualifikanten</div></div>`;
  const nextBtn = inst.hasNext
    ? `<button class="btn btn-primary btn-continue" id="btn-next-sub">Weiter: ${inst.isQualifier ? 'Hauptfeld' : inst.cat === 'qschool' ? `Tag ${inst.sub + 2}` : `Turnier ${inst.sub + 2}`} ▸</button>`
    : `<button class="btn btn-primary btn-continue" id="btn-close">Zurück zum Hub ▸</button>`;
  return `${win || card ? confetti() : ''}<div class="panel stack center ${win || card ? 'celebrate' : ''}">
    <div class="label">${inst.subLabel ? `${esc(inst.subLabel)} von ${inst.count} beendet` : 'Turnier beendet'}</div>
    <h2 class="${win || card || qual ? 'gold' : ''}">${card ? '🎉 Tourcard gewonnen!' : win ? '🏆 Turniersieg!' : qual ? '✅ Qualifiziert!' : placeLabel(inst.place)}</h2>
    ${card ? `<p>Du spielst ab sofort mit Tourcard (gültig bis Ende ${s.player.cardUntil}).</p>` : ''}
    <div class="kpi-grid" style="text-align:left">
      <div class="kpi"><div class="label">Preisgeld</div><div class="v gold num">${fmtEUR(inst.prize)}</div></div>
      <div class="kpi"><div class="label">XP${inst.xpBoost ? ` · <b class="gold">Boost ×${fmtNum(inst.xpBoost, 2)}</b>` : ''}</div><div class="v cyan num">+${inst.xp} XP</div></div>
      ${winnerKpi}
      <div class="kpi"><div class="label">Kontostand</div><div class="v num">${fmtEUR(s.finance.balance)}</div></div>
    </div>
    <div style="text-align:left">${levelBar(s)}</div>
    ${nextBtn}
  </div>
  ${interviewPanel(s)}
  ${trainingPanel(s, inst)}`;
}

export function render(app) {
  const s = app.state, inst = s.activeEvent;
  if (!inst) return `${topbar({ title: 'Turnier' })}<div class="panel">Kein laufendes Turnier.</div>`;
  const body = inst.done ? donePanel(s, inst) : inst.playerAlive ? matchPanel(s, inst) : outPanel(inst);
  const prizeTxt = inst.cards ? `${inst.stopAt} Tourcards` : inst.stopAt > 1 ? `${inst.stopAt} Plätze im Hauptfeld` : `Sieger ${fmtEUR(inst.prizes.W ?? 0)}`;
  return `${topbar({ title: inst.name, sub: `${catTag(inst.cat)} ${esc(inst.city)} · ${inst.fieldSize} Spieler · ${prizeTxt}`, back: 'hub' })}
    <div class="stack">${body}${myPath(s, inst)}${groupTables(s, inst)}
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
        ${row('Bogey-Reste', a.bogey ?? 0, b.bogey ?? 0, v => v, false)}
        ${row('Bestes Leg', a.bestLeg || 99, b.bestLeg || 99, v => (v === 99 ? '–' : `${v} Darts`), false)}
      </table>
      <p class="center cyan" style="margin-top:12px;font-weight:700">+${lm.xp} XP</p>`,
    actions: [{ label: 'Weiter', cls: 'btn-primary', onClick: onClose }],
  });
}

export function mount(root, app, params = {}) {
  const s = app.state;
  bindRaise(root, app);
  bindInterview(root, app);
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
  root.querySelector('#btn-next-sub')?.addEventListener('click', () => {
    nextSub(s); app.save(); app.go('event');
  });
  root.querySelector('#btn-close')?.addEventListener('click', () => {
    closeEvent(s); app.save(); app.go('hub');
  });
}
