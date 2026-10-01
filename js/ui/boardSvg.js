// Dartscheibe als SVG-String (Koordinaten in mm wie board.js, viewBox -200…200) – genutzt von matchUI und watch
import { ORDER, R, segAngle } from '../board.js';

// ---------- Scheibe (SVG, einmal erzeugt) ----------
const P = (r, a) => { const t = a * Math.PI / 180; return `${(Math.sin(t) * r).toFixed(2)} ${(-Math.cos(t) * r).toFixed(2)}`; };
const sector = (r1, r2, a0, a1) => `M${P(r2, a0)}A${r2} ${r2} 0 0 1 ${P(r2, a1)}L${P(r1, a1)}A${r1} ${r1} 0 0 0 ${P(r1, a0)}Z`;
const ring = (r1, r2) => `M0 ${-r2}A${r2} ${r2} 0 1 1 0 ${r2}A${r2} ${r2} 0 1 1 0 ${-r2}ZM0 ${-r1}A${r1} ${r1} 0 1 0 0 ${r1}A${r1} ${r1} 0 1 0 0 ${-r1}Z`;

let boardCache = '';
export function boardSvg() {
  if (boardCache) return boardCache;
  let segs = '', nums = '';
  ORDER.forEach((n, i) => {
    const a0 = i * 18 - 9, a1 = i * 18 + 9, dark = i % 2 === 0;
    const single = dark ? '#16181d' : '#efe3c4', bed = dark ? '#d8283d' : '#169a52';
    segs += `<path d="${sector(R.outerBull, R.tripleIn, a0, a1)}" fill="${single}"/>`
      + `<path d="${sector(R.tripleIn, R.tripleOut, a0, a1)}" fill="${bed}"/>`
      + `<path d="${sector(R.tripleOut, R.doubleIn, a0, a1)}" fill="${single}"/>`
      + `<path d="${sector(R.doubleIn, R.doubleOut, a0, a1)}" fill="${bed}"/>`;
    const [x, y] = P(186, i * 18).split(' ');
    nums += `<text x="${x}" y="${y}" class="bd-num">${n}</text>`;
  });
  boardCache = `<circle r="200" fill="#0b0d12"/><circle r="${R.doubleOut + 2}" fill="#2a2d33"/>
    ${segs}<circle r="${R.outerBull}" fill="#169a52"/><circle r="${R.bull}" fill="#d8283d"/>
    <g class="bd-wire">${ORDER.map((_, i) => `<line x1="${P(R.outerBull, i * 18 - 9).split(' ')[0]}" y1="${P(R.outerBull, i * 18 - 9).split(' ')[1]}" x2="${P(R.doubleOut, i * 18 - 9).split(' ')[0]}" y2="${P(R.doubleOut, i * 18 - 9).split(' ')[1]}"/>`).join('')}
    ${[R.bull, R.outerBull, R.tripleIn, R.tripleOut, R.doubleIn, R.doubleOut].map(r => `<circle r="${r}"/>`).join('')}</g>
    ${nums}`;
  return boardCache;
}

// Umriss des Zielfeldes
export function regionPath(label) {
  if (label === 'BULL') return ring(0.01, R.bull);
  if (label === '25') return ring(R.bull, R.outerBull);
  const a = segAngle(+label.slice(1)), k = label[0];
  const [r1, r2] = k === 'T' ? [R.tripleIn, R.tripleOut] : k === 'D' ? [R.doubleIn, R.doubleOut] : [R.tripleOut, R.doubleIn];
  return sector(r1, r2, a - 9, a + 9);
}

