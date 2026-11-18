// Eigene Icons statt Emojis (Version 168/169, Nutzerwunsch, Stil nach der NSS-Vorlage): eher realistische Clip-Art mit weichem Glanz,
// dünnen farbverwandten Konturen und kleinen Kompositionen (z. B. Pfeil + Scheibe). Größe in em (CSS .nsd-ico), breite Icons mit .wide.
// icon(name) liefert das SVG als String. Neue Icons im gleichen Stil ergänzen.
let uid = 0;                                            // eindeutige Verlaufs-IDs je Aufruf (mehrere gleiche Icons auf einer Seite)
const mk = (vb, wide, build) => () => {
  const p = `ni${++uid}-`, L = (id, stops, x2 = 0, y2 = 1) => `<linearGradient id="${p}${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
  const R = (id, stops, cx = 0.35, cy = 0.3) => `<radialGradient id="${p}${id}" cx="${cx}" cy="${cy}" r="0.8">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</radialGradient>`;
  const u = id => `url(#${p}${id})`;
  const { defs, body } = build({ L, R, u });
  return `<svg class="nsd-ico${wide ? ' wide' : ''}" viewBox="${vb}" aria-hidden="true"><defs>${defs}</defs>${body}</svg>`;
};
const hl = (d, o = 0.55) => `<path d="${d}" fill="#fff" opacity="${o}"/>`;   // Lichtreflex
const GOLD = [[0, '#8a5a00'], [0.22, '#e0a100'], [0.45, '#fff2a8'], [0.62, '#ffd23a'], [1, '#9c6400']];
const SKIN = [[0, '#ffe2c4'], [1, '#e2a273']];
const STEEL = [[0, '#f4f6f8'], [0.45, '#b9c1c9'], [1, '#5e666f']];

// Dartscheibe (realistisch: 20 Segmente, Double/Triple-Ringe) – Mittelpunkt cx, cy, Radius r
const board = (cx, cy, r) => {
  const seg = [], a0 = -Math.PI / 2 - Math.PI / 20, pt = (rad, a) => `${(cx + rad * Math.cos(a)).toFixed(2)} ${(cy + rad * Math.sin(a)).toFixed(2)}`;
  const ring = (r1, r2, i, col) => { const a = a0 + i * Math.PI / 10, b = a + Math.PI / 10;
    return `<path d="M${pt(r1, a)} L${pt(r2, a)} A${r2} ${r2} 0 0 1 ${pt(r2, b)} L${pt(r1, b)} A${r1} ${r1} 0 0 0 ${pt(r1, a)} Z" fill="${col}"/>`; };
  for (let i = 0; i < 20; i++) {
    const even = i % 2 === 0;
    seg.push(ring(r * 0.1, r * 0.82, i, even ? '#1d1d1d' : '#f1e3bf'), ring(r * 0.47, r * 0.55, i, even ? '#d42a2f' : '#1f8f3a'), ring(r * 0.82, r * 0.9, i, even ? '#d42a2f' : '#1f8f3a'));
  }
  return `<circle cx="${cx}" cy="${cy}" r="${r * 1.12}" fill="#1a1a1a" stroke="#000" stroke-width=".6"/>${seg.join('')}
    <circle cx="${cx}" cy="${cy}" r="${r * 0.1}" fill="#1f8f3a"/><circle cx="${cx}" cy="${cy}" r="${r * 0.045}" fill="#d42a2f"/>
    <ellipse cx="${cx - r * 0.35}" cy="${cy - r * 0.45}" rx="${r * 0.55}" ry="${r * 0.3}" fill="#fff" opacity=".12" transform="rotate(-30 ${cx - r * 0.35} ${cy - r * 0.45})"/>`;
};
// Dart (horizontal, Spitze links bei x, y), Gesamtlänge len; fl = Flight-Füllung, steel = Barrel-Füllung
const dart = (x, y, len, fl, steel) => `<g transform="translate(${x} ${y}) scale(${len / 60})">
    <path d="M0 0 L9 -1.1 V1.1 Z" fill="#cfd5db" stroke="#6b737c" stroke-width=".5"/>
    <rect x="9" y="-3.2" width="20" height="6.4" rx="2.6" fill="${steel}" stroke="#4b535c" stroke-width=".7"/>
    ${[13, 16, 19, 22, 25].map(v => `<path d="M${v} -3 V3" stroke="#3b4148" stroke-width=".8" opacity=".55"/>`).join('')}
    <rect x="29" y="-1.3" width="13" height="2.6" fill="#2d3238"/><rect x="29" y="-1.3" width="13" height="1" fill="#fff" opacity=".25"/>
    <path d="M40 0 L50 -9 L60 -9.5 L56 0 Z" fill="${fl}" stroke="#00000055" stroke-width=".6"/><path d="M40 0 L50 9 L60 9.5 L56 0 Z" fill="${fl}" stroke="#00000055" stroke-width=".6" opacity=".85"/>
    <path d="M44 -2 L51 -7.5 L57 -7.8" stroke="#fff" stroke-width="1" fill="none" opacity=".6"/></g>`;

const ICONS = {
  // Ranglisten: goldener Pokal
  ranks: mk('0 0 48 48', false, ({ L, u }) => ({
    defs: L('g', GOLD, 1, 0) + L('gd', [[0, '#c98a00'], [1, '#7a4a00']]),
    body: `<path d="M13 9 C3 8 4 24 16 24 M35 9 C45 8 44 24 32 24" fill="none" stroke="#7a4a00" stroke-width="3.6"/><path d="M13 9 C3 8 4 24 16 24 M35 9 C45 8 44 24 32 24" fill="none" stroke="#f2c230" stroke-width="2"/>
      <path d="M11 5 H37 C37 18 33 27 26 29.5 V34 H22 V29.5 C15 27 11 18 11 5 Z" fill="${u('g')}" stroke="#8a5a00" stroke-width=".9"/>
      <ellipse cx="24" cy="5" rx="13" ry="2.4" fill="#c98a00" stroke="#8a5a00" stroke-width=".8"/><ellipse cx="24" cy="5.2" rx="11" ry="1.4" fill="#7a4a00"/>
      <path d="M17 34 H31 L33 38.5 H15 Z" fill="${u('g')}" stroke="#8a5a00" stroke-width=".8"/><rect x="12" y="38.5" width="24" height="6" rx="1.2" fill="${u('gd')}" stroke="#5a3600" stroke-width=".8"/>
      ${hl('M14.5 7.5 H19 C18.5 15 19.5 21 22 26 C17 23 15 16 14.5 7.5 Z', 0.6)}`,
  })),
  // Fähigkeit: Dartscheibe mit Dart (wie Hütchen + Ball in der Vorlage)
  skill: mk('0 0 48 48', false, ({ L, u }) => ({
    defs: L('st', STEEL) + L('fl', [[0, '#7fd3ff'], [1, '#1e6fd9']]),
    body: `${board(21, 27, 17)}<g transform="rotate(-42 22 26)">${dart(22, 26, 30, u('fl'), u('st'))}</g>`,
  })),
  // Leben: drei Personen
  life: mk('0 0 48 48', false, ({ L, R, u }) => {
    const person = (x, y, s, shirt, hair) => `<path d="M${x - 11 * s} ${y + 22 * s} C${x - 11 * s} ${y + 11 * s} ${x - 6 * s} ${y + 8 * s} ${x} ${y + 8 * s} C${x + 6 * s} ${y + 8 * s} ${x + 11 * s} ${y + 11 * s} ${x + 11 * s} ${y + 22 * s} Z" fill="${u(shirt)}" stroke="#00000055" stroke-width=".8"/>
      <circle cx="${x}" cy="${y}" r="${6.2 * s}" fill="${u('skin')}" stroke="#a0623a" stroke-width=".7"/>
      <path d="M${x - 6.3 * s} ${y - 0.5 * s} C${x - 6.5 * s} ${y - 8 * s} ${x + 6.5 * s} ${y - 8 * s} ${x + 6.3 * s} ${y - 0.5 * s} C${x + 3 * s} ${y - 4 * s} ${x - 3 * s} ${y - 4 * s} ${x - 6.3 * s} ${y - 0.5 * s} Z" fill="${hair}"/>
      ${hl(`M${x - 8 * s} ${y + 18 * s} C${x - 8 * s} ${y + 13 * s} ${x - 5 * s} ${y + 10.5 * s} ${x - 2 * s} ${y + 10 * s} C${x - 5 * s} ${y + 12.5 * s} ${x - 6 * s} ${y + 15 * s} ${x - 6 * s} ${y + 18 * s} Z`, 0.35)}`;
    return {
      defs: R('skin', SKIN) + L('b', [[0, '#8fc6ff'], [1, '#2459b8']]) + L('r', [[0, '#ff9a8a'], [1, '#c4271c']]) + L('gr', [[0, '#a6f08c'], [1, '#2f8a22']]),
      body: person(14, 12, 0.9, 'b', '#3b2618') + person(34, 12, 0.9, 'r', '#c9922e') + person(24, 20, 1.05, 'gr', '#6b3d1e'),
    };
  }),
  // Shop: Einkaufswagen
  shop: mk('0 0 56 48', true, ({ L, u }) => ({
    defs: L('bk', [[0, '#f2f4f6'], [1, '#8c949c']]) + L('red', [[0, '#ff7a6b'], [1, '#b8160c']]),
    body: `<path d="M3 7 H9 L12 11" fill="none" stroke="#5e666f" stroke-width="2.6" stroke-linecap="round"/><rect x="1" y="4.5" width="8" height="4.5" rx="2" fill="${u('red')}"/>
      <path d="M11 11 H53 L47 32 H17 Z" fill="${u('bk')}" stroke="#5e666f" stroke-width="1.6" stroke-linejoin="round"/>
      ${[17, 23, 29, 35, 41, 47].map(x => `<path d="M${x} 11 L${x + (x - 30) * 0.12} 32" stroke="#5e666f" stroke-width="1"/>`).join('')}
      <path d="M12.5 16 H51.5 M14 21 H50 M15.5 26.5 H48.5" stroke="#5e666f" stroke-width="1"/>
      <path d="M17 32 L19 37 H47" fill="none" stroke="#5e666f" stroke-width="2"/>
      <circle cx="22" cy="41.5" r="3.6" fill="#2a2f36"/><circle cx="43" cy="41.5" r="3.6" fill="#2a2f36"/><circle cx="22" cy="41.5" r="1.3" fill="#c9ced3"/><circle cx="43" cy="41.5" r="1.3" fill="#c9ced3"/>`,
  })),
  // Getränke: Bierflasche + volles Glas
  beer: mk('0 0 48 48', false, ({ L, u }) => ({
    defs: L('bot', [[0, '#3b1d07'], [0.4, '#8a4a14'], [0.6, '#b0661f'], [1, '#3b1d07']], 1, 0) + L('lab', [[0, '#fff6d6'], [1, '#e7cf8f']]) + L('bee', [[0, '#ffe27a'], [0.5, '#f5b324'], [1, '#c97a00']]),
    body: `<path d="M9 44 V20 C9 16 12 15 12 11 V4 H18 V11 C18 15 21 16 21 20 V44 Z" fill="${u('bot')}" stroke="#2a1404" stroke-width=".8"/>
      <rect x="11.5" y="2" width="7" height="3" rx="1" fill="#d4a017"/><rect x="9" y="25" width="12" height="10" fill="${u('lab')}"/><path d="M11 28 H19 M11 31 H17" stroke="#b02020" stroke-width="1.2"/>
      ${hl('M10.6 21 C10.6 18 12.5 17 13.3 14 V40 H10.6 Z', 0.3)}
      <path d="M22 16 H43 L41 44 H24 Z" fill="${u('bee')}" stroke="#a86400" stroke-width=".9"/>
      <path d="M21 17 C19 11 25 9 28 12 C30 8 37 8 38 12 C42 10 46 14 43 18 C41 20 23 20 21 17 Z" fill="#fffdf4" stroke="#d9cfae" stroke-width=".8"/>
      ${hl('M25 21 H28 L27 41 H25.5 Z', 0.45)}<circle cx="33" cy="30" r=".9" fill="#fff" opacity=".7"/><circle cx="36" cy="36" r=".7" fill="#fff" opacity=".7"/><circle cx="31" cy="38" r=".6" fill="#fff" opacity=".7"/>`,
  })),
  // kleine Vorrats-Icons: Bierglas, Schnapsglas, Cocktail
  pint: mk('0 0 48 48', false, ({ L, u }) => ({
    defs: L('bee', [[0, '#ffe27a'], [0.5, '#f5b324'], [1, '#c97a00']]),
    body: `<path d="M11 14 H37 L34 45 H14 Z" fill="${u('bee')}" stroke="#a86400" stroke-width="1"/><path d="M9 15 C7 8 14 6 17 9 C19 4 28 4 30 9 C34 6 41 9 39 15 C37 18 11 18 9 15 Z" fill="#fffdf4" stroke="#d9cfae" stroke-width=".9"/>${hl('M15 20 H19 L17.5 41 H16 Z', 0.45)}`,
  })),
  shot: mk('0 0 48 48', false, ({ L, u }) => ({
    defs: L('sh', [[0, '#fff1c9'], [1, '#d89a2a']]),
    body: `<path d="M11 9 H37 L33 44 H15 Z" fill="#eef7ff" fill-opacity=".85" stroke="#8aa4bb" stroke-width="1"/><path d="M13.2 22 H34.8 L33 44 H15 Z" fill="${u('sh')}"/>${hl('M14 11 H18 L16.5 41 H15.6 Z', 0.6)}`,
  })),
  cocktail: mk('0 0 48 48', false, ({ L, u }) => ({
    defs: L('ck', [[0, '#d6f7ff'], [1, '#2aa3cc']]),
    body: `<path d="M5 8 H43 L24 28 Z" fill="${u('ck')}" stroke="#1d7aa0" stroke-width="1"/><path d="M24 28 V42 M15 43 H33" stroke="#8aa4bb" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M33 10 L40 1" stroke="#7a5230" stroke-width="1.4"/><circle cx="33" cy="10" r="4" fill="#3cb043" stroke="#1f6e24" stroke-width=".8"/><circle cx="32" cy="9" r="1.2" fill="#e8372c"/>${hl('M9 10 H20 L22 13 H12 Z', 0.6)}`,
  })),
  // Darts: einzelner Dart quer (wie die Schuhe in der Vorlage)
  darts: mk('0 0 64 32', true, ({ L, u }) => ({
    defs: L('st', STEEL) + L('fl', [[0, '#ff8a7a'], [1, '#c4161c']]),
    body: `<g transform="rotate(-12 32 16)">${dart(2, 17, 60, u('fl'), u('st'))}</g>`,
  })),
  // Spielen: grüner Pfeil + Dartscheibe (wie Pfeil + Ball in der Vorlage)
  play: mk('0 0 72 44', true, ({ L, u }) => ({
    defs: L('ar', [[0, '#b6f08c'], [0.5, '#52b638'], [1, '#2f8a22']]),
    body: `<path d="M2 15 H20 V7 L36 21 L20 35 V27 H2 Z" fill="${u('ar')}" stroke="#1d5a12" stroke-width="1.6" stroke-linejoin="round"/>
      ${hl('M4 17 H22 V12 L31 20 H4 Z', 0.3)}${board(55, 22, 14)}`,
  })),
  // Tourcard: schlichtes Schild
  card: mk('0 0 48 48', false, ({ L, u }) => ({
    defs: L('sh', [[0, '#ffffff'], [0.55, '#dfe5ec'], [1, '#9aa7b6']]),
    body: `<path d="M24 4 L41 9.5 V22 C41 33 33 40 24 44 C15 40 7 33 7 22 V9.5 Z" fill="${u('sh')}" stroke="#6b7a8c" stroke-width="1.2"/>${hl('M10 12 L24 7.5 V40 C16 36 10 30 10 22 Z', 0.35)}`,
  })),
  // Start: Haus
  home: mk('0 0 48 48', false, ({ L, u }) => ({
    defs: L('roof', [[0, '#ff8a7a'], [1, '#b8160c']]) + L('wall', [[0, '#fffaf0'], [1, '#e2d4b4']]),
    body: `<rect x="31" y="8" width="5" height="10" fill="#9c5a3c" stroke="#5e2f18" stroke-width=".7"/><rect x="11" y="22" width="26" height="20" fill="${u('wall')}" stroke="#a89670" stroke-width=".8"/>
      <path d="M4 25 L24 7 L44 25 Z" fill="${u('roof')}" stroke="#7a0e06" stroke-width=".9" stroke-linejoin="round"/><rect x="20.5" y="30" width="7" height="12" rx=".8" fill="#8a4b2a"/>
      <rect x="13.5" y="26.5" width="5" height="5" fill="#9fd6ff" stroke="#5f7d99" stroke-width=".6"/><rect x="29.5" y="26.5" width="5" height="5" fill="#9fd6ff" stroke="#5f7d99" stroke-width=".6"/>${hl('M9 23 L24 9.5 L28 13 L12 25 Z', 0.35)}`,
  })),
  // Spielplan: Kalenderblatt
  calendar: mk('0 0 48 48', false, ({ L, u }) => ({
    defs: L('cal', [[0, '#ff7a6b'], [1, '#c4271c']]) + L('pg', [[0, '#ffffff'], [1, '#e3e6ea']]),
    body: `<rect x="6" y="9" width="36" height="34" rx="3" fill="${u('pg')}" stroke="#8c96a2" stroke-width=".9"/><path d="M6 12 C6 10 7 9 9 9 H39 C41 9 42 10 42 12 V19 H6 Z" fill="${u('cal')}"/>
      <rect x="13" y="4" width="4" height="9" rx="2" fill="#5e666f"/><rect x="31" y="4" width="4" height="9" rx="2" fill="#5e666f"/>
      ${[0, 1, 2].map(r => [0, 1, 2, 3].map(c => `<rect x="${11 + c * 7}" y="${23 + r * 6}" width="4" height="3.5" rx=".6" fill="${r === 1 && c === 2 ? '#c4271c' : '#9aa6b5'}"/>`).join('')).join('')}`,
  })),
  // News: Zeitung
  news: mk('0 0 48 48', false, ({ L, u }) => ({
    defs: L('np', [[0, '#ffffff'], [1, '#d7dde4']]),
    body: `<path d="M10 8 H42 V38 C42 41 40 43 37 43 H8 C5 43 4 41 4 38 V16 H10 Z" fill="${u('np')}" stroke="#7d8896" stroke-width=".9"/><path d="M10 16 V38 C10 41 8 43 6 43" fill="none" stroke="#7d8896" stroke-width=".9"/>
      <rect x="15" y="13" width="22" height="7" fill="#2b3a55"/><path d="M15 25 H25 M15 30 H25 M15 35 H25 M29 25 H37 M29 30 H37 M29 35 H37" stroke="#8c96a2" stroke-width="2"/>`,
  })),
  // Statistik: Klemmbrett
  stats: mk('0 0 48 48', false, ({ L, u }) => ({
    defs: L('clip', [[0, '#d39a62'], [1, '#7f4c22']]),
    body: `<rect x="8" y="7" width="32" height="38" rx="3" fill="${u('clip')}" stroke="#5a3415" stroke-width=".9"/><rect x="12" y="12" width="24" height="29" fill="#fdfdf9"/>
      <rect x="18" y="4" width="12" height="7" rx="2" fill="#c9ced3" stroke="#6b737c" stroke-width=".8"/>
      <rect x="15" y="31" width="4" height="7" fill="#2e9c3a"/><rect x="22" y="24" width="4" height="14" fill="#2a74c9"/><rect x="29" y="18" width="4" height="20" fill="#d8323a"/>`,
  })),
  // Team: Aktenkoffer
  team: mk('0 0 48 48', false, ({ L, u }) => ({
    defs: L('case', [[0, '#b8845a'], [1, '#5e3a1e']]),
    body: `<path d="M18 13 V9 C18 7 19 6 21 6 H27 C29 6 30 7 30 9 V13" fill="none" stroke="#3b2414" stroke-width="2.6"/><rect x="5" y="13" width="38" height="28" rx="4" fill="${u('case')}" stroke="#3b2414" stroke-width=".9"/>
      <path d="M5 24 H43" stroke="#3b2414" stroke-width="1.2"/><rect x="21" y="21" width="6" height="6" rx="1" fill="#ffd34d" stroke="#8a5a00" stroke-width=".7"/>${hl('M8 15 H40 V19 H8 Z', 0.25)}`,
  })),
  // Sponsoren: Münzstapel + Münze
  sponsors: mk('0 0 48 48', false, ({ L, u }) => {
    const coin = y => `<path d="M6 ${y} V${y + 5} C6 ${y + 11} 30 ${y + 11} 30 ${y + 5} V${y}" fill="${u('c1')}" stroke="#8a5a00" stroke-width=".8"/><ellipse cx="18" cy="${y}" rx="12" ry="4.5" fill="${u('c2')}" stroke="#8a5a00" stroke-width=".8"/>`;
    return { defs: L('c1', [[0, '#ffd34d'], [1, '#b87400']]) + L('c2', [[0, '#fff6b8'], [1, '#ffc928']]),
      body: `${coin(33)}${coin(26)}${coin(19)}<circle cx="35" cy="20" r="10" fill="${u('c2')}" stroke="#8a5a00" stroke-width=".9"/><circle cx="35" cy="20" r="7" fill="none" stroke="#c98a00" stroke-width="1"/>
        <path d="M35 15.5 l1.4 3 3.3 .4 -2.4 2.2 .6 3.3 -2.9 -1.6 -2.9 1.6 .6 -3.3 -2.4 -2.2 3.3 -.4 Z" fill="#fff" stroke="#c98a00" stroke-width=".6"/>` };
  }),
  // Optionen: Zahnrad
  gear: mk('0 0 48 48', false, ({ L, u }) => ({
    defs: L('gear', [[0, '#eef1f4'], [0.5, '#a4adb6'], [1, '#5b636c']]),
    body: `<path d="${Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4, p = (r, d) => `${(24 + r * Math.cos(a + d)).toFixed(1)} ${(24 + r * Math.sin(a + d)).toFixed(1)}`;
      return `${i ? 'L' : 'M'}${p(14, -0.22)} L${p(20, -0.16)} L${p(20, 0.16)} L${p(14, 0.22)}`; }).join(' ')} Z" fill="${u('gear')}" stroke="#4b535c" stroke-width=".9" stroke-linejoin="round"/>
      <circle cx="24" cy="24" r="6" fill="#2b3340"/>`,
  })),
};
export const icon = name => (ICONS[name] ?? ICONS.home)();
export const ICON_NAMES = Object.keys(ICONS);
