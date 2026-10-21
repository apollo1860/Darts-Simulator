// Pixel-Zuschauer (eigene Grafik): einmal per Canvas gezeichnet, als CSS-Variablen --crowd-top / --crowd-bottom.
// Oben: sitzende Fans von vorn (Tribüne gegenüber), unten: jubelnde Fans von hinten mit erhobenen Armen.
import { RNG } from '../../rng.js';

const SHIRTS = ['#e53935', '#1e88e5', '#43a047', '#fdd835', '#fb8c00', '#8e24aa', '#00acc1', '#f06292', '#ffffff', '#3949ab', '#c0ca33', '#6d4c41'];
const SKIN = ['#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#ffdbac', '#f5cba7'];
const HAIR = ['#2b1b0e', '#4a2c14', '#000000', '#a0522d', '#d4a017', '#5b5b5b'];

function draw(w, h, back, seed) {
  if (typeof document === 'undefined') return '';
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d'), rng = new RNG(seed);
  g.fillStyle = back ? '#1d1838' : '#241e44';
  g.fillRect(0, 0, w, h);
  const rows = 3, rowH = Math.floor(h / rows);
  for (let r = 0; r < rows; r++) {
    const y0 = r * rowH + (back ? 1 : 2), off = r % 2 ? 2 : 0;
    for (let x = off; x < w - 3; x += 4) {
      if (!back && x > w / 2 - 6 && x < w / 2 + 4) continue;              // Treppengang in der Mitte
      const shirt = rng.pick(SHIRTS), skin = rng.pick(SKIN), hair = rng.pick(HAIR);
      if (back) {                                                          // von hinten: Haare, Trikot, Arme hoch
        const up = rng.chance(0.55);
        g.fillStyle = shirt; g.fillRect(x, y0 + 3, 3, rowH - 4);
        g.fillStyle = hair; g.fillRect(x, y0 + 1, 3, 2);
        if (up) { g.fillStyle = skin; g.fillRect(x - 1, y0, 1, 3); g.fillRect(x + 3, y0, 1, 3); }
      } else {                                                             // von vorn: Gesicht, Trikot
        g.fillStyle = hair; g.fillRect(x, y0, 3, 1);
        g.fillStyle = skin; g.fillRect(x, y0 + 1, 3, 2);
        g.fillStyle = shirt; g.fillRect(x, y0 + 3, 3, rowH - 4);
        g.fillStyle = '#000'; g.fillRect(x + 1, y0 + 2, 1, 1);
      }
    }
  }
  return c.toDataURL();
}

let done = false;
export function installCrowd() {
  if (done || typeof document === 'undefined') return;
  done = true;
  const st = document.documentElement.style;
  st.setProperty('--crowd-top', `url(${draw(120, 18, false, 7)})`);
  st.setProperty('--crowd-bottom', `url(${draw(120, 18, true, 11)})`);
}
