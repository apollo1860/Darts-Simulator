// Spielbericht nach jedem eigenen Match: Statistik beider Spieler, Note, Star-Status, Fans, Energie
import { esc, fmtNum, surname } from '../../../util.js';
import { flag } from '../../../../data/nations.js';
import { starPct, starNeed } from '../../../nsd.js';
import { starMeter, frame, header, titleBand, darkBar, bar, meter, starIcon, heartIcon, bindHead } from '../frame.js';
import { nameOf } from './tourevent.js';
import { getPlayer } from '../../../world.js';

export const nsd = true;
const HELP = '<p>Die <b>Note</b> (1–10) ergibt sich aus Average, Checkout-Quote, 180ern und dem Ergebnis. Gute Noten bringen Fans.</p><p><b>Star-Status</b>: Siege bringen Fortschritt (mehr bei 0er-Siegen, hohem Average, starken Gegnern und großen Turnieren), Niederlagen kosten etwas – nie unter die erreichte Stufe.</p>';

export function render(app) {
  const s = app.state, inst = s.activeEvent, lm = inst?.lastMatch, p = s.player;
  if (!lm) return frame({ body: header(p.name), bottom: bar([null, null, { go: 'event', icon: '<span class="nsd-check">✔</span>', wide: true }]) });
  const a = lm.me, b = lm.opp_;
  const row = (label, x, y) => `<tr><td class="c">${x}</td><td class="c lbl">${label}</td><td class="c">${y}</td></tr>`;
  const pct = v => `${fmtNum((v ?? 0) * 100, 1)} %`;
  const tone = lm.rating >= 7.5 ? 'good' : lm.rating < 5 ? 'bad' : '';
  return frame({
    body: `${header(p.name)}${titleBand(esc(lm.round))}
      ${darkBar(`${lm.won ? 'SIEG' : 'NIEDERLAGE'} ${lm.score[0]} : ${lm.score[1]}`, lm.won ? '' : 'red')}
      <table class="nsd-table nsd-stats">
        <tr><th>${flag(p.nation)} Du</th><th></th><th class="nm">${flag(getPlayer(s, lm.opp)?.nation)} ${esc(surname(nameOf(s, lm.opp)))}</th></tr>
        ${row('Average', fmtNum(a.avg, 2), fmtNum(b.avg, 2))}
        ${row('180er', a.s180, b.s180)}
        ${row('140+', a.s140, b.s140)}
        ${row('100+', a.s100, b.s100)}
        ${row('Checkout', pct(a.coPct), pct(b.coPct))}
        ${row('High Finish', a.hiFinish || '–', b.hiFinish || '–')}
        ${row('Bestes Leg', a.bestLeg ? `${a.bestLeg} D.` : '–', b.bestLeg ? `${b.bestLeg} D.` : '–')}
      </table>
      <div class="nsd-result">
        <div class="nsd-result-row"><span>Note</span><b class="nsd-grade ${tone}">${fmtNum(lm.rating, 1)}</b></div>
        <div class="nsd-result-row"><span>Star-Status</span><b>${lm.star >= 0 ? '+' : ''}${fmtNum(lm.star, 1)}${lm.ups ? ' ⬆' : ''}</b></div>
        ${starMeter(app.state, { starIcon, starPct, starNeed })}
        <div class="nsd-result-row"><span>Fans</span><b>${lm.fans > 0 ? '+' : ''}${lm.fans}</b></div>
        ${meter({ icon: heartIcon(), label: `Energie ${lm.energy} %`, pct: lm.energy, tone: lm.energy >= 20 ? 'green' : 'red' })}
      </div>`,
    bottom: bar([null, null, { go: 'event', icon: '<span class="nsd-check">✔</span>', wide: true }]),
  });
}

export function mount(root, app) { bindHead(root, app, HELP); }
