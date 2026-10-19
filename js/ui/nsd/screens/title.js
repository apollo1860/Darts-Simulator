// Titelbildschirm: Logo, Dartscheibe, Menü (Spielen · Trainieren · Optionen)
import { frame, starIcon } from '../frame.js';
import { boardSvg } from '../../boardSvg.js';
import { toast } from '../../components.js';

export const nsd = true;
export function render() {
  const logoStar = '<svg viewBox="0 0 48 46"><path d="M24 2l6.6 14.2 15.4 1.8-11.4 10.6 3 15.3L24 36.4 10.4 43.9l3-15.3L2 18l15.4-1.8z" fill="#fff"/></svg>';
  return frame({
    bg: 'plain',
    body: `<div class="nsd-titlescreen">
      <div class="nsd-logo">
        <div class="row1"><div class="box">${logoStar}</div><div class="ns">New Star</div></div>
        <div class="dt">Darts<span class="tm">™</span></div>
      </div>
      <div class="nsd-menu">
        <button class="nsd-btn row" data-go="slots"><span class="ic">${starIcon()}</span><span class="lb">Spielen</span></button>
        <button class="nsd-btn row" id="t-train"><span class="ic">🎯</span><span class="lb">Trainieren</span></button>
        <button class="nsd-btn row" data-go="options"><span class="ic">🔧</span><span class="lb">Optionen</span></button>
      </div>
      <svg class="nsd-board" viewBox="-200 -200 400 400">${boardSvg()}</svg>
      <div class="nsd-grass"></div>
    </div>`,
  });
}
export function mount(root) {
  root.querySelector('#t-train').onclick = () => toast('Freies Training kommt mit den Minispielen (Etappe 3).');
}
