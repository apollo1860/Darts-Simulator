// Illustrationen für den Lifestyle-Shop (eigene SVGs): Bausteine
export const BOX = '0 0 100 100', WIDE = '0 0 160 100';

// art(id, viewBox, draw): draw bekommt { lin, rad } (Verläufe mit eindeutigen IDs je Bild)
export function art(id, vb, draw) {
  const defs = [], norm = s => s.map((c, i) => (Array.isArray(c) ? c : [i / (s.length - 1), c]));
  const stops = s => norm(s).map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('');
  const lin = (n, s, d = 'v') => {
    const xy = { v: 'x1="0" y1="0" x2="0" y2="1"', h: 'x1="0" y1="0" x2="1" y2="0"', d: 'x1="0" y1="0" x2="1" y2="1"' }[d];
    defs.push(`<linearGradient id="${id}-${n}" ${xy}>${stops(s)}</linearGradient>`);
    return `url(#${id}-${n})`;
  };
  const rad = (n, s, cx = 0.5, cy = 0.5, r = 0.5) => {
    defs.push(`<radialGradient id="${id}-${n}" cx="${cx}" cy="${cy}" r="${r}">${stops(s)}</radialGradient>`);
    return `url(#${id}-${n})`;
  };
  const body = draw({ lin, rad });   // erst zeichnen: dabei entstehen die Verläufe
  return `<svg class="nsd-art ${vb === WIDE ? 'wide' : ''}" viewBox="${vb}" preserveAspectRatio="xMidYMid ${vb === WIDE ? 'slice' : 'meet'}" aria-hidden="true"><defs>${defs.join('')}</defs>${body}</svg>`;
}

export const shadow = (cx = 50, cy = 90, rx = 34, ry = 4.5) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#000" opacity=".28"/>`;
export const OUT = '#1d2430';   // dunkle Kontur

// Rad mit Reifen, Felge und Speichen
export const wheel = (cx, cy, r, rim = '#d5dae0') => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#17181c"/>
  <circle cx="${cx}" cy="${cy}" r="${(r * 0.64).toFixed(1)}" fill="${rim}" stroke="#6d757f" stroke-width="${(r * 0.08).toFixed(1)}"/>
  ${[0, 60, 120].map(a => `<line x1="${cx}" y1="${(cy - r * 0.6).toFixed(1)}" x2="${cx}" y2="${(cy + r * 0.6).toFixed(1)}" stroke="#7b838d" stroke-width="${(r * 0.09).toFixed(1)}" transform="rotate(${a} ${cx} ${cy})"/>`).join('')}
  <circle cx="${cx}" cy="${cy}" r="${(r * 0.2).toFixed(1)}" fill="#4a525b"/>`;

// Wasser (Wellen) unter Booten
export const water = (y = 84, c1 = '#46b4ee', c2 = '#1c72c4', x0 = 0, x1 = 100) => `<path d="M${x0} ${y} q6 -4 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 V100 H${x0} Z" fill="${c2}" opacity=".95"/>
  <path d="M${x0} ${y + 3} q6 -4 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0" fill="none" stroke="${c1}" stroke-width="1.6" opacity=".9"/>`;

// Wolken, Himmel, Bäume usw. für Szenen (Immobilien, 160 × 100)
export const cloud = (x, y, s = 1, o = 0.85) => `<g opacity="${o}" transform="translate(${x} ${y}) scale(${s})" fill="#fff"><ellipse cx="0" cy="0" rx="14" ry="5"/><ellipse cx="-7" cy="-3.5" rx="7" ry="5"/><ellipse cx="5" cy="-5" rx="8" ry="6"/></g>`;
export const sky = (lin, a = '#5aa9ec', b = '#cfeaff') => `<rect width="160" height="100" fill="${lin('sky', [a, b])}"/>${cloud(34, 18, 1)}${cloud(120, 12, 0.8)}${cloud(86, 28, 0.6, 0.6)}`;
export const ground = (lin, y = 78, a = '#6cc04a', b = '#3f8f2c') => `<rect y="${y}" width="160" height="${100 - y}" fill="${lin('gr', [a, b])}"/>`;
export const hills = (y, c1 = '#4f9a3c', c2 = '#3b7e2e') => `<path d="M0 ${y} Q30 ${y - 16} 60 ${y - 4} T120 ${y - 6} T160 ${y - 2} V100 H0Z" fill="${c1}"/><path d="M0 ${y + 6} Q40 ${y - 6} 80 ${y + 3} T160 ${y + 2} V100 H0Z" fill="${c2}"/>`;
export const tree = (x, b, s = 1, c = '#2f8a32') => `<g transform="translate(${x} ${b}) scale(${s})"><rect x="-1.6" y="-10" width="3.2" height="11" fill="#6b4524"/><circle cx="0" cy="-17" r="9" fill="${c}"/><circle cx="-4" cy="-14" r="6" fill="#fff" opacity=".12"/><circle cx="3" cy="-20" r="5" fill="#000" opacity=".1"/></g>`;
export const pine = (x, b, s = 1, snow = false) => `<g transform="translate(${x} ${b}) scale(${s})"><rect x="-1.5" y="-4" width="3" height="5" fill="#5a3a1e"/>${[[-3, 12, 9], [-9, 10, 8], [-15, 8, 7]].map(([y, w]) => `<path d="M${-w} ${y} L0 ${y - 13} L${w} ${y}Z" fill="#1f6b3a"/>${snow ? `<path d="M${-w * 0.55} ${y - 6} L0 ${y - 13} L${w * 0.55} ${y - 6} Q0 ${y - 4} ${-w * 0.55} ${y - 6}Z" fill="#fff"/>` : ''}`).join('')}</g>`;
export const palm = (x, b, s = 1, lean = 6) => `<g transform="translate(${x} ${b}) scale(${s})"><path d="M0 0 Q${lean * 0.3} -16 ${lean} -30" stroke="#8a6234" stroke-width="3" fill="none" stroke-linecap="round"/>
  <g transform="translate(${lean} -30)" fill="#2f9a3c" stroke="#1f6b2a" stroke-width=".6">${[-70, -35, 0, 35, 70].map(a => `<path d="M0 0 Q10 -12 24 -4 Q10 -6 0 0Z" transform="rotate(${a - 90})"/>`).join('')}<path d="M0 0 Q-10 -12 -24 -4 Q-10 -6 0 0Z"/></g></g>`;
export const win = (x, y, w, h, c = '#a8d8f8', f = '#fff') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"/><rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="${h - 2}" fill="${c}"/><path d="M${x + w / 2} ${y + 1}V${y + h - 1}M${x + 1} ${y + h / 2}H${x + w - 1}" stroke="${f}" stroke-width=".8"/><path d="M${x + 1} ${y + 1}l${w * 0.4} 0 -${w * 0.3} ${h * 0.5}z" fill="#fff" opacity=".35"/>`;
