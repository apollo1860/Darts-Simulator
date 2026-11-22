// Spielbericht nach jedem eigenen Match: Statistik beider Spieler, Note, Star-Status, Fans, Energie
import { esc, fmtNum, surname } from '../../../util.js';
import { flag } from '../../../../data/nations.js';
import { starPct, starNeed } from '../../../nsd.js';
import { starMeter, frame, header, darkBar, bar, meter, starIcon, heartIcon, bindHead, checkIcon, arrowIcon } from '../frame.js';
import { relBars, deltaTxt } from '../relbars.js';
import { nameOf } from './tourevent.js';
import { getPlayer } from '../../../world.js';

export const nsd = true;
const HELP = '<p>Die <b>Note</b> (1–10) ergibt sich aus Average, Checkout-Quote, 180ern und dem Ergebnis. Gute Noten bringen Fans.</p><p><b>Double-in</b> (nur World Grand Prix): getroffene Doppel zum Reinkommen / Darts, die dafür nötig waren.</p><p><b>Star-Status</b>: Siege bringen Fortschritt (mehr bei 0er-Siegen, hohem Average, starken Gegnern und großen Turnieren), Niederlagen kosten etwas – nie unter die erreichte Stufe.</p>';

// Version 149: zwei Seiten – 1) Spielstatistik, 2) Bewertung (Note, Beziehungen Manager/Fans/Sponsoren, Star-Status, Energie mit Zu-/Abnahme)
export function render(app, params = {}) {
  const s = app.state, inst = s.activeEvent, lm = inst?.lastMatch, p = s.player;
  if (!lm) return frame({ body: header(p.name), bottom: bar([null, null, { go: 'event', icon: checkIcon(), wide: true }]) });
  if (params.step === 2) return ratingSlide(app, s, lm, p);
  const a = lm.me, b = lm.opp_;
  const row = (label, x, y) => `<tr><td class="c">${x}</td><td class="c lbl">${label}</td><td class="c">${y}</td></tr>`;
  const pct = v => `${fmtNum((v ?? 0) * 100, 1)} %`;
  // World Cup: Team-Average und je Spieler der Einzel-Average (Version 80)
  const team = !!(lm.meM && lm.oppM), tm = (id, list) => (s.activeEvent?.teams?.[id]?.members ?? []).map((mid, i) => ({ name: surname(getPlayer(s, mid)?.name ?? '?'), st: list?.[i] }));
  const mine = team ? tm('P', lm.meM) : [], theirs = team ? tm(lm.opp, lm.oppM) : [];
  const cell = x => (x ? `<small>${esc(x.name)}</small><br>${x.st?.darts ? fmtNum(x.st.avg, 2) : '–'}` : '');
  const singles = team ? Array.from({ length: Math.max(mine.length, theirs.length) }, (_, i) => `<tr><td class="c">${cell(mine[i])}</td><td class="c lbl">Einzel-Ø</td><td class="c">${cell(theirs[i])}</td></tr>`).join('') : '';
  const tone = lm.rating >= 7.5 ? 'good' : lm.rating < 5 ? 'bad' : '';
  return frame({
    body: `${header(p.name)}
      ${darkBar(`${esc(lm.round)} · ${lm.won ? 'SIEG' : 'NIEDERLAGE'} ${lm.score[0]} : ${lm.score[1]}`, lm.won ? '' : 'red')}
      <table class="nsd-table nsd-stats compact">
        <tr><th>${flag(p.nation)} Du</th><th></th><th class="nm">${flag(getPlayer(s, lm.opp)?.nation)} ${esc(surname(nameOf(s, lm.opp)))}</th></tr>
        ${row(team ? 'Team-Ø' : 'Average', fmtNum(a.avg, 2), fmtNum(b.avg, 2))}${singles}
        ${a.f9 || b.f9 ? row('First 9', a.f9 ? fmtNum(a.f9, 2) : '–', b.f9 ? fmtNum(b.f9, 2) : '–') : ''}
        ${row('180er', a.s180, b.s180)}
        ${row('140+', a.s140, b.s140)}
        ${row('100+', a.s100, b.s100)}
        ${row('Checkout', pct(a.coPct), pct(b.coPct))}
        ${a.dinAtt || b.dinAtt ? row('Double-in', `${pct(a.dinPct ?? (a.dinAtt ? a.dinHit / a.dinAtt : 0))}<br><small>${a.dinHit ?? 0}/${a.dinAtt ?? 0}</small>`, `${pct(b.dinPct ?? (b.dinAtt ? b.dinHit / b.dinAtt : 0))}<br><small>${b.dinHit ?? 0}/${b.dinAtt ?? 0}</small>`) : ''}
        ${row('High Finish', a.hiFinish || '–', b.hiFinish || '–')}
        ${row('Bestes Leg', a.bestLeg ? `${a.bestLeg} D.` : '–', b.bestLeg ? `${b.bestLeg} D.` : '–')}
      </table>
      `,
    bottom: bar([null, null, { id: 'ms-next', icon: arrowIcon(), wide: true }]),
  });
}

function ratingSlide(app, s, lm, p) {
  const tone = lm.rating >= 7.5 ? 'good' : lm.rating < 5 ? 'bad' : '', e = Math.round(lm.energy ?? p.energy ?? 0), e0 = lm.eBefore ?? e;
  return frame({
    body: `${header(p.name)}<div class="nsd-title sm"><span>Bewertung</span></div>
      <div class="nsd-rate">
        <div class="nsd-rate-res ${lm.won ? '' : 'red'}">${esc(lm.round)} · ${lm.won ? 'Sieg' : 'Niederlage'} ${lm.score[0]} : ${lm.score[1]}</div>
        <div class="nsd-rate-grade ${tone}"><span>Note</span><b class="pop">${fmtNum(lm.rating, 1)}</b></div>
        <div class="nsd-relgrid">${relBars(s, lm.relBefore ?? {}, { keys: ['manager', 'fans', 'sponsors'], all: true, cls: 'sm' })}</div>
        ${starMeter(s, { starIcon, starPct, starNeed, extra: deltaTxt(lm.star ?? 0) })}
        ${meter({ icon: heartIcon(), label: `Energie ${e} % ${deltaTxt(e - e0)}`, pct: e, from: e0, tone: e >= 20 ? 'green' : 'red' })}
      </div>`,
    bottom: bar([null, null, { go: 'event', icon: checkIcon(), wide: true }]),
  });
}

export function mount(root, app) {
  bindHead(root, app, HELP);
  root.querySelector('#ms-next')?.addEventListener('click', () => app.go('matchstats', { step: 2 }));
}
