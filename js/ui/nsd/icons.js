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
  // Version 252: Schnaps = kleines Shotglas mit dunklem Kräuterlikör
  shot: mk('0 0 48 48', false, ({ L, u }) => ({
    defs: L('sh', [[0, '#7a3a14'], [0.55, '#3a1606'], [1, '#160602']]),
    body: `<g transform="translate(24 36.5) scale(1.22) translate(-24 -42)"><path d="M15 20 H33 L31 41 H17 Z" fill="#eef7ff" fill-opacity=".85" stroke="#8aa4bb" stroke-width="1"/>
      <path d="M16.2 25 H31.8 L30.4 38.5 H17.6 Z" fill="${u('sh')}"/><ellipse cx="24" cy="25" rx="7.8" ry="1.1" fill="#9a5a2a" opacity=".8"/>
      <path d="M17 38.5 H31 L30.8 41 H17.2 Z" fill="#cfe0ee" stroke="#8aa4bb" stroke-width=".8"/>${hl('M17 21.5 H19.6 L18.6 37 H17.9 Z', 0.6)}</g>`,
  })),
  // Version 229: Weinschorle – Weinglas mit heller, perlender Schorle
  wine: mk('0 0 48 48', false, ({ L, u }) => ({
    defs: L('ws', [[0, '#fff8c4'], [1, '#e6c24a']]),
    body: `<path d="M12 4 H36 C37 15 33 24 24 25 C15 24 11 15 12 4 Z" fill="#eef7ff" fill-opacity=".8" stroke="#8aa4bb" stroke-width="1"/>
      <path d="M12.6 11 H35.4 C35.4 19 31.5 23.6 24 24 C16.5 23.6 12.6 19 12.6 11 Z" fill="${u('ws')}"/>
      ${[[18, 18, 1], [23, 15, 1.2], [28, 19, 0.9], [26, 13, 0.8], [20, 13.5, 0.7]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity=".85"/>`).join('')}
      <path d="M24 25 V41 M15 43 H33" stroke="#8aa4bb" stroke-width="2.6" stroke-linecap="round"/>${hl('M15 6 H19 L18 18 H16 Z', 0.55)}`,
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
// ---- Version 170: weitere Icons (ersetzen die restlichen Emojis, Flaggen bleiben) ----
const face = (skin, mouth, extra = '') => mk('0 0 48 48', false, ({ R, u }) => ({
  defs: R('f', skin, 0.38, 0.32),
  body: `<circle cx="24" cy="24" r="20" fill="${u('f')}" stroke="#b07a00" stroke-width="1"/><ellipse cx="17" cy="20" rx="2.6" ry="3.4" fill="#3b2a12"/><ellipse cx="31" cy="20" rx="2.6" ry="3.4" fill="#3b2a12"/>${mouth}${extra}${hl('M10 18 C11 11 17 7 23 7 C17 9 13 13 12 19 Z', 0.5)}`,
}));
const YEL = [[0, '#fff3a0'], [0.6, '#ffcc33'], [1, '#e89a00']];
const medal = (a, b, rim) => mk('0 0 48 48', false, ({ L, R, u }) => ({
  defs: L('rb', [[0, '#4f8fe8'], [1, '#1d4fa8']]) + L('rr', [[0, '#ff6b5e'], [1, '#b8160c']]) + R('m', [[0, a], [1, b]]),
  body: `<path d="M12 2 H22 L28 20 H18 Z" fill="${u('rb')}"/><path d="M36 2 H26 L20 20 H30 Z" fill="${u('rr')}"/>
    <circle cx="24" cy="31" r="14" fill="${u('m')}" stroke="${rim}" stroke-width="1.4"/><circle cx="24" cy="31" r="10" fill="none" stroke="${rim}" stroke-width="1" opacity=".7"/>
    <path d="M24 24 l2.1 4.4 4.8 .6 -3.5 3.3 .9 4.8 -4.3 -2.4 -4.3 2.4 .9 -4.8 -3.5 -3.3 4.8 -.6 Z" fill="#fff" opacity=".85"/>${hl('M14 27 C15 22 19 19 23 18.5 C19 21 17 24 16.5 28 Z', 0.5)}`,
}));
const heartPath = 'M24 43 C24 43 4 30 4 16 C4 8 10 4 15.5 4 C19.5 4 22.5 6.5 24 9.5 C25.5 6.5 28.5 4 32.5 4 C38 4 44 8 44 16 C44 30 24 43 24 43 Z';
Object.assign(ICONS, {
  star: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('s', YEL),
    body: `<path d="M24 3 l6.2 13.3 14.5 1.7 -10.7 10 2.8 14.4 -12.8 -7.1 -12.8 7.1 2.8 -14.4 -10.7 -10 14.5 -1.7 Z" fill="${u('s')}" stroke="#c46a00" stroke-width="1.3" stroke-linejoin="round"/>${hl('M24 8 L28 17 L17 19 Z', 0.55)}` })),
  check: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('c', [[0, '#a6ec7a'], [0.5, '#4fb335'], [1, '#2a8420']]),
    body: `<path d="M4 25 L12 18 L20 27 L40 6 L45 11 L21 41 L17 41 Z" fill="${u('c')}" stroke="#1d5a12" stroke-width="1.6" stroke-linejoin="round"/>${hl('M12 20.5 L20 29 L39 8.5 L21 31 Z', 0.35)}` })),
  cross: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('x', [[0, '#ff8a7a'], [0.5, '#e2382b'], [1, '#a8180f']]),
    body: `<path d="M9 14 L14 9 L24 19 L34 9 L39 14 L29 24 L39 34 L34 39 L24 29 L14 39 L9 34 L19 24 Z" fill="${u('x')}" stroke="#6e0d07" stroke-width="1.4" stroke-linejoin="round"/>${hl('M11 14 L14 11 L23 20 L20 22 Z', 0.4)}` })),
  warning: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('w', [[0, '#fff2a0'], [1, '#f2b200']]),
    body: `<path d="M24 4 L45 42 H3 Z" fill="${u('w')}" stroke="#a87200" stroke-width="1.6" stroke-linejoin="round"/><rect x="21.5" y="16" width="5" height="14" rx="2" fill="#2a2a2a"/><circle cx="24" cy="35.5" r="2.8" fill="#2a2a2a"/>${hl('M24 9 L28 16 H20 Z', 0.4)}` })),
  flame: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('o', [[0, '#ffd04a'], [0.5, '#ff7a1a'], [1, '#d42a0f']]) + L('i', [[0, '#fffbd0'], [1, '#ffc23a']]),
    body: `<path d="M24 45 C12 45 7 36 9 27 C11 19 18 16 17 6 C25 10 29 17 28 23 C31 21 32 17 32 14 C38 19 41 26 39 33 C37 41 31 45 24 45 Z" fill="${u('o')}" stroke="#a81e08" stroke-width="1"/>
      <path d="M24 44 C18 44 15 39 16.5 34 C18 29 22 28 22 22 C27 26 29 30 28 34 C30 33 31 31 31 29 C34 33 33 39 30 42 C28.5 43.5 26.5 44 24 44 Z" fill="${u('i')}"/>` })),
  bolt: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('b', YEL),
    body: `<path d="M28 2 L9 27 H22 L18 46 L39 19 H26 Z" fill="${u('b')}" stroke="#b07400" stroke-width="1.4" stroke-linejoin="round"/>${hl('M27 6 L13 25 H20 Z', 0.45)}` })),
  mic: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('h', [[0, '#f4f6f8'], [0.5, '#a4adb6'], [1, '#4b535c']], 1, 0) + L('b', [[0, '#4a525c'], [0.5, '#1d2228'], [1, '#0b0d10']], 1, 0),
    body: `<rect x="17" y="2" width="14" height="20" rx="7" fill="${u('h')}" stroke="#3b4148" stroke-width="1"/>
      ${[6, 10, 14, 18].map(y => `<path d="M18 ${y} H30" stroke="#3b4148" stroke-width=".8" opacity=".55"/>`).join('')}<path d="M20.5 3.5 V20.5 M24 2 V22 M27.5 3.5 V20.5" stroke="#3b4148" stroke-width=".6" opacity=".4"/>
      <rect x="16.5" y="21" width="15" height="4" rx="1.5" fill="#c98a00" stroke="#6b3f1f" stroke-width=".7"/>
      <path d="M19 25 H29 L27 45 H21 Z" fill="${u('b')}" stroke="#0b0d10" stroke-width=".9"/>${hl('M19 6 C19 4 20.5 3 22 3 V20 C20 19 19 18 19 16 Z', 0.55)}` })),
  diamond: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('d', [[0, '#e6fbff'], [0.5, '#7ad7ff'], [1, '#2a8fd6']]),
    body: `<path d="M12 8 H36 L45 19 L24 44 L3 19 Z" fill="${u('d')}" stroke="#1d6fa8" stroke-width="1.2" stroke-linejoin="round"/><path d="M3 19 H45 M12 8 L18 19 L24 44 L30 19 L36 8 M18 19 L24 8 L30 19" fill="none" stroke="#1d6fa8" stroke-width=".9" opacity=".7"/>${hl('M12 9 L17.5 18.5 H5 Z', 0.55)}` })),
  medal: medal('#fff2a8', '#d9940a', '#8a5a00'),
  medalS: medal('#ffffff', '#9aa7b6', '#5e6b7a'),
  medalB: medal('#ffd7b0', '#b8682a', '#6e3a12'),
  crown: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('c', GOLD, 1, 0),
    body: `<path d="M5 14 L14 24 L24 8 L34 24 L43 14 L39 38 H9 Z" fill="${u('c')}" stroke="#8a5a00" stroke-width="1.2" stroke-linejoin="round"/><rect x="8" y="37" width="32" height="6" rx="1.5" fill="${u('c')}" stroke="#8a5a00" stroke-width="1"/>
      <circle cx="24" cy="29" r="3.2" fill="#d42a2f" stroke="#7a0e06" stroke-width=".7"/><circle cx="14" cy="31" r="2.3" fill="#2a74c9"/><circle cx="34" cy="31" r="2.3" fill="#2e9c3a"/>
      ${[[5, 14], [24, 8], [43, 14]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.8" fill="#fff2a8" stroke="#8a5a00" stroke-width=".8"/>`).join('')}` })),
  heart: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('h', [[0, '#ff7a7a'], [1, '#c40000']]),
    body: `<path d="${heartPath}" fill="${u('h')}" stroke="#8a0000" stroke-width="1.2"/><ellipse cx="15" cy="13" rx="6" ry="3.6" fill="#fff" opacity=".45"/>` })),
  heartBroken: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('h', [[0, '#ff7a7a'], [1, '#c40000']]),
    body: `<path d="${heartPath}" fill="${u('h')}" stroke="#8a0000" stroke-width="1.2"/><path d="M24 9.5 L20 18 L27 24 L21 31 L24 43" fill="none" stroke="#3a0000" stroke-width="2.4" stroke-linejoin="round"/>` })),
  // Version 213: Shoppingtour – zwei Einkaufstüten (pink + türkis) mit Kordelgriffen
  bags: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('p', [[0, '#ff8cc6'], [1, '#c2186f']]) + L('t', [[0, '#7ee8e0'], [1, '#0f8f87']]),
    body: `<path d="M8 17 C8 8 18 8 18 17" fill="none" stroke="#8a1150" stroke-width="2"/><path d="M4 17 H22 L24 42 H2 Z" fill="${u('p')}" stroke="#8a1150" stroke-width="1.2" stroke-linejoin="round"/>
      ${hl('M6 19 H9 L8 38 H5 Z', 0.35)}
      <path d="M27 21 C27 12 37 12 37 21" fill="none" stroke="#0b5f5a" stroke-width="2"/><path d="M21 21 H43 L45 44 H19 Z" fill="${u('t')}" stroke="#0b5f5a" stroke-width="1.2" stroke-linejoin="round"/>
      ${hl('M23 23 H26 L25.3 40 H22 Z', 0.35)}<circle cx="27" cy="21" r="1.2" fill="#0b5f5a"/><circle cx="37" cy="21" r="1.2" fill="#0b5f5a"/>
      <path d="M28.5 30 l1.6 3.2 3.5 .5 -2.5 2.4 .6 3.4 -3.2 -1.7 -3.2 1.7 .6 -3.4 -2.5 -2.4 3.5 -.5 Z" fill="#fff" opacity=".8"/>` })),
  ring: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('g', GOLD, 1, 0) + L('d', [[0, '#e6fbff'], [1, '#5ac0f0']]),
    body: `<circle cx="24" cy="30" r="13" fill="none" stroke="#8a5a00" stroke-width="6"/><circle cx="24" cy="30" r="13" fill="none" stroke="${u('g')}" stroke-width="4"/>
      <path d="M17 12 L20 6 H28 L31 12 L24 19 Z" fill="${u('d')}" stroke="#1d6fa8" stroke-width="1"/>${hl('M19 11 L21 7 H24 L21.5 12 Z', 0.6)}` })),
  ticket: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('t', [[0, '#ffd56b'], [1, '#e89a00']]),
    body: `<g transform="rotate(-15 24 24)"><path d="M4 14 H44 V20 C41 20 41 28 44 28 V34 H4 V28 C7 28 7 20 4 20 Z" fill="${u('t')}" stroke="#a86400" stroke-width="1.2"/>
      <path d="M33 15 V33" stroke="#a86400" stroke-width="1.2" stroke-dasharray="2 2"/><rect x="10" y="19" width="18" height="10" rx="1.5" fill="none" stroke="#a86400" stroke-width="1.2"/>
      <path d="M19 21 l1.4 2.9 3.2 .4 -2.3 2.2 .6 3.1 -2.9 -1.6 -2.9 1.6 .6 -3.1 -2.3 -2.2 3.2 -.4 Z" fill="#fff" opacity=".85"/></g>` })),
  swords: mk('0 0 48 48', false, ({ L, u }) => {
    const sw = r => `<g transform="rotate(${r} 24 24)"><path d="M24 2 L27 6 V30 H21 V6 Z" fill="${u('bl')}" stroke="#5e666f" stroke-width=".9"/><rect x="15" y="30" width="18" height="4" rx="1.5" fill="#c98a00" stroke="#6b3f1f" stroke-width=".8"/><rect x="22" y="34" width="4" height="9" fill="#6b3f1f"/><circle cx="24" cy="44.5" r="2.4" fill="#c98a00"/></g>`;
    return { defs: L('bl', STEEL, 1, 0), body: sw(-40) + sw(40) };
  }),
  wrench: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('w', STEEL, 1, 1),
    body: `<path d="M30 4 C24 4 20 10 22 16 L5 33 C3 35 3 39 5 41 L7 43 C9 45 13 45 15 43 L32 26 C38 28 44 24 44 18 L37 24 L30 22 L28 15 L34 8 C33 5 31.5 4 30 4 Z" fill="${u('w')}" stroke="#4b535c" stroke-width="1.2" stroke-linejoin="round"/><circle cx="10" cy="38" r="2" fill="#4b535c"/>` })),
  fitness: mk('0 0 56 48', true, ({ L, u }) => ({ defs: L('d', [[0, '#5a6470'], [0.5, '#2a3038'], [1, '#14181d']]) + L('h', STEEL),
    body: `<rect x="12" y="21" width="32" height="6" rx="2" fill="${u('h')}" stroke="#4b535c" stroke-width=".8"/>
      ${[[4, 12, 8, 24], [12, 8, 6, 32], [38, 8, 6, 32], [44, 12, 8, 24]].map(([x, y, w, h]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2.5" fill="${u('d')}" stroke="#0b0d10" stroke-width="1"/>`).join('')}
      ${hl('M13.5 10 H16 V38 H13.5 Z', 0.25)}${hl('M39.5 10 H42 V38 H39.5 Z', 0.25)}` })),
  scarf: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('s', [[0, '#ff6b5e'], [1, '#b8160c']]),
    body: `<path d="M8 8 C16 14 32 14 40 8 L42 16 C33 22 15 22 6 16 Z" fill="${u('s')}" stroke="#6e0d07" stroke-width="1"/>
      <path d="M28 18 L36 44 H28 L22 20 Z" fill="${u('s')}" stroke="#6e0d07" stroke-width="1"/>
      <path d="M24.5 27 L31.5 27 M26.5 34 L33.5 34" stroke="#fff" stroke-width="3"/><path d="M15 12 V19 M24 13.5 V20.5 M33 12 V19" stroke="#fff" stroke-width="3"/>
      <path d="M28 44 V47 M31 44 V47 M34 44 V47" stroke="#b8160c" stroke-width="1.4"/>` })),
  party: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('p', [[0, '#c48bff'], [1, '#6a2ec4']]),
    body: `<path d="M4 44 L16 14 L34 32 Z" fill="${u('p')}" stroke="#3d1580" stroke-width="1.2" stroke-linejoin="round"/><path d="M8 34 L14 40 M11 26 L22 37 M14 19 L29 34" stroke="#ffd34d" stroke-width="2.2"/>
      <circle cx="30" cy="9" r="2.4" fill="#ff5a5a"/><circle cx="40" cy="16" r="2.2" fill="#3cc0ff"/><circle cx="38" cy="5" r="1.8" fill="#ffd34d"/><circle cx="44" cy="28" r="2" fill="#5ad65a"/>
      <path d="M22 6 C24 10 21 12 24 15 M33 20 C36 18 38 22 42 20" fill="none" stroke="#ff8a3d" stroke-width="2" stroke-linecap="round"/>` })),
  dice: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('d', [[0, '#ffffff'], [1, '#d9dee5']]),
    body: `<rect x="7" y="7" width="34" height="34" rx="7" fill="${u('d')}" stroke="#7d8896" stroke-width="1.3"/>${[[16, 16], [32, 16], [24, 24], [16, 32], [32, 32]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#c4161c"/>`).join('')}${hl('M10 12 C10 10 11 9.5 13 9.5 H30 L12 26 Z', 0.4)}` })),
  faceHappy: face(YEL, '<path d="M14 28 C17 36 31 36 34 28 Z" fill="#7a2e12" stroke="#5a2008" stroke-width="1"/>'),
  faceNeutral: face(YEL, '<path d="M16 32 H32" stroke="#5a2008" stroke-width="2.6" stroke-linecap="round"/>'),
  faceSad: face(YEL, '<path d="M15 35 C19 29 29 29 33 35" fill="none" stroke="#5a2008" stroke-width="2.6" stroke-linecap="round"/>'),
  faceNervous: face(YEL, '<path d="M15 33 C18 30 21 35 24 32 C27 29 30 34 33 31" fill="none" stroke="#5a2008" stroke-width="2.4" stroke-linecap="round"/>', '<path d="M38 8 C41 13 43 16 40 19 C37 21 35 17 38 8 Z" fill="#7fd3ff" stroke="#1e6fd9" stroke-width=".8"/>'),
  faceAngry: face([[0, '#ffb08a'], [0.6, '#ff6b3d'], [1, '#c4271c']], '<path d="M15 35 C19 29 29 29 33 35" fill="none" stroke="#5a1008" stroke-width="2.6" stroke-linecap="round"/>', '<path d="M11 13 L21 17 M37 13 L27 17" stroke="#5a1008" stroke-width="2.6" stroke-linecap="round"/>'),
  cold: mk('0 0 48 48', false, () => ({ defs: '',
    body: `<g stroke="#2a8fd6" stroke-width="3.4" stroke-linecap="round">${[0, 60, 120].map(r => `<path d="M24 4 V44 M18 8 L24 13 L30 8 M18 40 L24 35 L30 40" transform="rotate(${r} 24 24)"/>`).join('')}</g>
      <g stroke="#d6f3ff" stroke-width="1.4" stroke-linecap="round">${[0, 60, 120].map(r => `<path d="M24 6 V42" transform="rotate(${r} 24 24)"/>`).join('')}</g>` })),
  chartUp: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('g', [[0, '#a6ec7a'], [1, '#2a8420']]),
    body: `<rect x="4" y="6" width="40" height="38" rx="3" fill="#fbfbf7" stroke="#8c96a2" stroke-width="1"/><path d="M9 38 L19 27 L26 31 L39 15" fill="none" stroke="${u('g')}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M31 13 H41 V23 Z" fill="#2a8420"/>` })),
  chartDown: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('r', [[0, '#ff8a7a'], [1, '#b8160c']]),
    body: `<rect x="4" y="6" width="40" height="38" rx="3" fill="#fbfbf7" stroke="#8c96a2" stroke-width="1"/><path d="M9 14 L19 25 L26 21 L39 35" fill="none" stroke="${u('r')}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M31 37 H41 V27 Z" fill="#b8160c"/>` })),
  flag: mk('0 0 48 48', false, () => ({ defs: '',
    body: `<path d="M9 4 V46" stroke="#5e666f" stroke-width="3" stroke-linecap="round"/><path d="M10 6 C20 2 26 10 42 6 V26 C26 30 20 22 10 26 Z" fill="#fff" stroke="#2a2a2a" stroke-width="1"/>
      ${[0, 1, 2, 3].map(c => [0, 1].map(r => `<rect x="${10 + c * 8 + (r % 2) * 0}" y="${8 + r * 9 + (c % 2) * 0}" width="4" height="4.5" fill="#2a2a2a" transform="translate(${(r + c) % 2 ? 4 : 0} ${c % 2 ? 4.5 : 0})"/>`).join('')).join('')}` })),
  tv: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('s', [[0, '#5aa8ff'], [1, '#1a3f8a']]) + L('f', [[0, '#5a6470'], [1, '#1d2228']]),
    body: `<path d="M16 4 L24 11 L32 4" fill="none" stroke="#5e666f" stroke-width="2"/><rect x="3" y="11" width="42" height="29" rx="4" fill="${u('f')}" stroke="#0b0d10" stroke-width="1"/>
      <rect x="7" y="15" width="34" height="21" rx="2" fill="${u('s')}"/><rect x="14" y="40" width="20" height="4" rx="1" fill="#2a3038"/>${hl('M8 16 H24 L9 30 Z', 0.3)}` })),
  car: mk('0 0 56 48', true, ({ L, u }) => ({ defs: L('c', [[0, '#ff7a6b'], [0.5, '#e2382b'], [1, '#8a1209']]),
    body: `<path d="M4 34 V27 C4 24 6 23 9 22.5 L15 13 C16 11.5 18 11 20 11 H35 C37 11 38.5 12 39.5 13.5 L45 22 C50 23 52 24.5 52 28 V34 Z" fill="${u('c')}" stroke="#5a0b05" stroke-width="1.1" stroke-linejoin="round"/>
      <path d="M17 21 L21 14.5 H27 V21 Z M30 21 V14.5 H35 L39.5 21 Z" fill="#bfe6ff" stroke="#5a7a99" stroke-width=".8"/>
      <circle cx="15" cy="35" r="6" fill="#1d2228"/><circle cx="41" cy="35" r="6" fill="#1d2228"/><circle cx="15" cy="35" r="2.5" fill="#c9ced3"/><circle cx="41" cy="35" r="2.5" fill="#c9ced3"/>
      <rect x="47" y="25" width="4" height="3" rx="1" fill="#fff6b0"/>${hl('M8 24 L45 24 L46 26 H7 Z', 0.35)}` })),
  plane: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('p', [[0, '#ffffff'], [1, '#a9b6c4']], 1, 1),
    body: `<path d="M44 4 C42 2 38 3 35 6 L27 14 L8 9 L4 13 L20 21 L12 29 L6 28 L3 31 L11 36 L16 44 L19 41 L18 35 L26 27 L34 43 L38 39 L33 20 L41 12 C44 9 46 6 44 4 Z" fill="${u('p')}" stroke="#5e6b7a" stroke-width="1.1" stroke-linejoin="round"/>
      <path d="M35 8 L40 13" stroke="#2a74c9" stroke-width="2"/>` })),
  phone: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('s', [[0, '#4a90ff'], [1, '#1a3f8a']]),
    body: `<rect x="13" y="3" width="22" height="42" rx="4" fill="#1d2228" stroke="#0b0d10" stroke-width="1"/><rect x="15.5" y="8" width="17" height="30" rx="1.5" fill="${u('s')}"/><circle cx="24" cy="41.5" r="1.7" fill="#5e666f"/>${hl('M16 9 H25 L16 24 Z', 0.3)}` })),
  bed: mk('0 0 56 48', true, ({ L, u }) => ({ defs: L('b', [[0, '#8fc6ff'], [1, '#2459b8']]) + L('w', [[0, '#c78a55'], [1, '#7f4c22']]),
    body: `<rect x="3" y="12" width="5" height="30" rx="1.5" fill="${u('w')}"/><rect x="48" y="22" width="5" height="20" rx="1.5" fill="${u('w')}"/>
      <rect x="6" y="28" width="44" height="8" rx="2" fill="#f4f4f0" stroke="#8c96a2" stroke-width=".8"/><path d="M18 28 H50 V24 C50 22 48 21 46 21 H22 C19 21 18 23 18 25 Z" fill="${u('b')}" stroke="#1d3f80" stroke-width=".9"/>
      <rect x="8" y="21" width="11" height="8" rx="3.5" fill="#ffffff" stroke="#8c96a2" stroke-width=".8"/>` })),
  globe: mk('0 0 48 48', false, ({ R, u }) => ({ defs: R('g', [[0, '#9fe0ff'], [1, '#1a6fc4']]),
    body: `<circle cx="24" cy="24" r="20" fill="${u('g')}" stroke="#0f4a8a" stroke-width="1.2"/>
      <path d="M12 12 C17 11 18 16 22 15 C25 14 23 19 19 21 C15 23 17 28 13 29 C9 27 8 18 12 12 Z M28 9 C33 9 38 13 40 18 C36 19 33 16 30 18 C27 20 31 25 34 26 C38 27 36 34 32 37 C29 33 27 30 26 26 C24 21 26 14 28 9 Z" fill="#55c25a" stroke="#2a7a2a" stroke-width=".8"/>${hl('M10 16 C13 9 19 6 25 6 C19 9 15 12 13 18 Z', 0.4)}` })),
  megaphone: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('m', [[0, '#ff8a7a'], [1, '#b8160c']]),
    body: `<path d="M6 18 H14 L36 6 V42 L14 30 H6 Z" fill="${u('m')}" stroke="#6e0d07" stroke-width="1.2" stroke-linejoin="round"/><rect x="3" y="17" width="8" height="14" rx="2" fill="#f4f4f0" stroke="#8c96a2" stroke-width=".8"/>
      <path d="M14 30 L18 42 H23 L20 32" fill="#5e666f"/><path d="M40 17 C43 20 43 28 40 31 M43 12 C48 18 48 30 43 36" fill="none" stroke="#ffd34d" stroke-width="2.2" stroke-linecap="round"/>` })),
  injury: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('p', [[0, '#ffe2c4'], [1, '#e8b48a']]),
    body: `<g transform="rotate(-40 24 24)"><rect x="2" y="15" width="44" height="18" rx="9" fill="${u('p')}" stroke="#a0623a" stroke-width="1.1"/><rect x="16" y="15" width="16" height="18" fill="#fff5ea" stroke="#a0623a" stroke-width=".8"/>
      ${[[19, 19], [24, 19], [29, 19], [19, 24], [24, 24], [29, 24], [19, 29], [24, 29], [29, 29]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9" fill="#d9a07a"/>`).join('')}
      <path d="M22 21 H26 V23 H28 V27 H26 V29 H22 V27 H20 V23 H22 Z" fill="#e2382b" opacity=".85"/></g>` })),
  shirt: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('s', [[0, '#8fc6ff'], [1, '#2459b8']]),
    body: `<path d="M17 4 C19 8 29 8 31 4 L44 11 L38 21 L34 18 V44 H14 V18 L10 21 L4 11 Z" fill="${u('s')}" stroke="#13306e" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M17 4 C19 10 29 10 31 4" fill="none" stroke="#fff" stroke-width="1.6"/><text x="24" y="34" text-anchor="middle" font-size="12" font-weight="900" fill="#fff" font-family="Arial">1</text>` })),
  fish: mk('0 0 56 48', true, ({ L, u }) => ({ defs: L('f', [[0, '#9fe8ff'], [0.5, '#2aa3cc'], [1, '#13607a']]),
    body: `<path d="M6 24 C14 10 34 8 44 22 L53 13 V35 L44 26 C34 40 14 38 6 24 Z" fill="${u('f')}" stroke="#0d4a5e" stroke-width="1.2" stroke-linejoin="round"/>
      <circle cx="15" cy="21" r="3" fill="#fff"/><circle cx="15.5" cy="21" r="1.5" fill="#14171b"/><path d="M24 15 C27 20 27 28 24 33" fill="none" stroke="#0d4a5e" stroke-width="1" opacity=".6"/>${hl('M10 21 C15 14 25 12 33 14 C25 15 18 18 13 23 Z', 0.4)}` })),
  broom: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('b', [[0, '#ffe08a'], [1, '#c98a1e']]),
    body: `<path d="M41 3 L24 26" stroke="#7f4c22" stroke-width="3.4" stroke-linecap="round"/><path d="M24 22 L30 27 L28 30 L21 25 Z" fill="#c4271c"/>
      <path d="M20 24 L31 32 C27 40 19 45 6 45 C9 38 13 30 20 24 Z" fill="${u('b')}" stroke="#8a5a00" stroke-width="1"/><path d="M14 33 L10 43 M19 35 L15 44 M24 36 L22 43" stroke="#8a5a00" stroke-width="1" opacity=".7"/>` })),
  magnifier: mk('0 0 48 48', false, ({ R, u }) => ({ defs: R('g', [[0, '#e6f6ff'], [1, '#8cc8ee']]),
    body: `<path d="M29 29 L43 43" stroke="#3b2414" stroke-width="7" stroke-linecap="round"/><path d="M29 29 L43 43" stroke="#7f4c22" stroke-width="4" stroke-linecap="round"/>
      <circle cx="19" cy="19" r="14" fill="${u('g')}" stroke="#5e666f" stroke-width="3.6"/>${hl('M10 16 C11 11 15 8 20 7.5 C15 10 13 13 12.5 18 Z', 0.7)}` })),
  burst: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('b', [[0, '#fff3a0'], [0.5, '#ffb020'], [1, '#e2382b']]),
    body: `<path d="${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6, r = i % 2 ? 11 : 21; return `${i ? 'L' : 'M'}${(24 + r * Math.cos(a)).toFixed(1)} ${(24 + r * Math.sin(a)).toFixed(1)}`; }).join(' ')} Z" fill="${u('b')}" stroke="#a81e08" stroke-width="1.2" stroke-linejoin="round"/>` })),
  hundred: mk('0 0 48 48', false, () => ({ defs: '',
    body: `<text x="24" y="31" text-anchor="middle" font-size="22" font-weight="900" font-style="italic" font-family="Arial" fill="#e2382b" stroke="#7a0e06" stroke-width=".8">100</text><path d="M7 36 H41 M9 41 H39" stroke="#e2382b" stroke-width="2.6" stroke-linecap="round"/>` })),
  pause: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('p', STEEL),
    body: `<rect x="10" y="8" width="10" height="32" rx="2.5" fill="${u('p')}" stroke="#3b4148" stroke-width="1"/><rect x="28" y="8" width="10" height="32" rx="2.5" fill="${u('p')}" stroke="#3b4148" stroke-width="1"/>` })),
  ff: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('p', [[0, '#b6f08c'], [1, '#2f8a22']]),
    body: `<path d="M4 9 L23 24 L4 39 Z M24 9 L43 24 L24 39 Z" fill="${u('p')}" stroke="#1d5a12" stroke-width="1.3" stroke-linejoin="round"/>` })),
  skip: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('p', [[0, '#b6f08c'], [1, '#2f8a22']]),
    body: `<path d="M4 9 L20 24 L4 39 Z M20 9 L36 24 L20 39 Z" fill="${u('p')}" stroke="#1d5a12" stroke-width="1.3" stroke-linejoin="round"/><rect x="37" y="9" width="6" height="30" rx="1.5" fill="${u('p')}" stroke="#1d5a12" stroke-width="1.2"/>` })),
  chat: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('c', [[0, '#ffffff'], [1, '#d7dde4']]),
    body: `<path d="M8 6 H40 C43 6 45 8 45 11 V29 C45 32 43 34 40 34 H20 L10 43 V34 H8 C5 34 3 32 3 29 V11 C3 8 5 6 8 6 Z" fill="${u('c')}" stroke="#7d8896" stroke-width="1.2" stroke-linejoin="round"/>
      <circle cx="15" cy="20" r="2.6" fill="#7d8896"/><circle cx="24" cy="20" r="2.6" fill="#7d8896"/><circle cx="33" cy="20" r="2.6" fill="#7d8896"/>` })),
  letter: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('e', [[0, '#ffffff'], [1, '#dfe4ea']]),
    body: `<rect x="3" y="10" width="42" height="29" rx="3" fill="${u('e')}" stroke="#7d8896" stroke-width="1.2"/><path d="M4 12 L24 27 L44 12" fill="none" stroke="#7d8896" stroke-width="1.4"/><circle cx="39" cy="12" r="6" fill="#e2382b" stroke="#7a0e06" stroke-width=".8"/>` })),
  scale: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('g', GOLD, 1, 0),
    body: `<path d="M24 6 V40 M8 12 H40" stroke="#8a5a00" stroke-width="2.6" stroke-linecap="round"/><path d="M14 44 H34 L31 39 H17 Z" fill="${u('g')}" stroke="#8a5a00" stroke-width="1"/>
      <path d="M8 12 L3 26 M8 12 L13 26 M40 12 L35 26 M40 12 L45 26" stroke="#8a5a00" stroke-width="1"/><path d="M2 26 H14 C14 31 2 31 2 26 Z M34 26 H46 C46 31 34 31 34 26 Z" fill="${u('g')}" stroke="#8a5a00" stroke-width="1"/><circle cx="24" cy="6" r="2.6" fill="${u('g')}"/>` })),
  plus: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('p', [[0, '#b6f08c'], [1, '#2f8a22']]),
    body: `<path d="M19 6 H29 V19 H42 V29 H29 V42 H19 V29 H6 V19 H19 Z" fill="${u('p')}" stroke="#1d5a12" stroke-width="1.3" stroke-linejoin="round"/>` })),
  hourglass: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('s', [[0, '#ffe08a'], [1, '#d9940a']]) + L('w', [[0, '#c78a55'], [1, '#7f4c22']]),
    body: `<path d="M12 7 H36 C36 18 27 21 27 24 C27 27 36 30 36 41 H12 C12 30 21 27 21 24 C21 21 12 18 12 7 Z" fill="#eaf6ff" fill-opacity=".8" stroke="#7d8896" stroke-width="1"/>
      <path d="M17 36 C19 31 22.5 30 24 30 C25.5 30 29 31 31 36 Z M17 13 H31 C30 17 26 19 24 21 C22 19 18 17 17 13 Z" fill="${u('s')}"/><rect x="9" y="3" width="30" height="5" rx="1.5" fill="${u('w')}"/><rect x="9" y="40" width="30" height="5" rx="1.5" fill="${u('w')}"/>` })),
  bulb: mk('0 0 48 48', false, ({ R, u }) => ({ defs: R('b', [[0, '#fffbd0'], [1, '#ffc928']]),
    body: `<path d="M24 3 C13 3 7 11 7 19 C7 27 15 30 16 36 H32 C33 30 41 27 41 19 C41 11 35 3 24 3 Z" fill="${u('b')}" stroke="#b07400" stroke-width="1.1"/><rect x="16" y="36" width="16" height="8" rx="2" fill="#9aa3ad" stroke="#4b535c" stroke-width=".8"/><path d="M17 40 H31" stroke="#4b535c" stroke-width=".8"/>${hl('M12 17 C13 11 17 8 22 7 C17 10 15 13 14.5 19 Z', 0.6)}` })),
  person: mk('0 0 48 48', false, ({ L, R, u }) => ({ defs: R('sk', SKIN) + L('s', [[0, '#5a6470'], [1, '#1d2228']]),
    body: `<path d="M8 46 C8 33 14 28 24 28 C34 28 40 33 40 46 Z" fill="${u('s')}" stroke="#0b0d10" stroke-width=".9"/><path d="M21 28 L24 36 L27 28 Z" fill="#fff"/><path d="M23 30 L25 30 L25.5 38 L24 40 L22.5 38 Z" fill="#c4161c"/>
      <circle cx="24" cy="16" r="10" fill="${u('sk')}" stroke="#a0623a" stroke-width=".8"/><path d="M14 15 C14 5 34 5 34 15 C30 10 18 10 14 15 Z" fill="#3b2618"/>` })),
  money: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('m', [[0, '#e0c48a'], [1, '#9c7432']]),
    body: `<path d="M18 10 L15 4 H33 L30 10 C40 15 44 26 42 34 C40 42 33 45 24 45 C15 45 8 42 6 34 C4 26 8 15 18 10 Z" fill="${u('m')}" stroke="#5e4416" stroke-width="1.1" stroke-linejoin="round"/>
      <path d="M17 10 H31" stroke="#5e4416" stroke-width="2.4"/><text x="24" y="36" text-anchor="middle" font-size="16" font-weight="900" fill="#2e7a2e" font-family="Arial">★</text>` })),
  gamepad: mk('0 0 56 48', true, ({ L, u }) => ({ defs: L('g', [[0, '#5a6470'], [1, '#1d2228']]),
    body: `<path d="M14 12 H42 C50 12 54 20 54 30 C54 38 49 41 45 37 L39 31 H17 L11 37 C7 41 2 38 2 30 C2 20 6 12 14 12 Z" fill="${u('g')}" stroke="#0b0d10" stroke-width="1"/>
      <path d="M12 19 V29 M7 24 H17" stroke="#d6dde5" stroke-width="3" stroke-linecap="round"/><circle cx="40" cy="20" r="2.6" fill="#e2382b"/><circle cx="46" cy="25" r="2.6" fill="#2e9c3a"/><circle cx="34" cy="25" r="2.6" fill="#2a74c9"/><circle cx="40" cy="30" r="2.6" fill="#ffc928"/>` })),
  laptop: mk('0 0 56 48', true, ({ L, u }) => ({ defs: L('s', [[0, '#4a90ff'], [1, '#1a3f8a']]) + L('b', STEEL),
    body: `<rect x="10" y="6" width="36" height="25" rx="2.5" fill="#2a3038" stroke="#0b0d10" stroke-width="1"/><rect x="13" y="9" width="30" height="19" fill="${u('s')}"/><path d="M4 34 H52 L48 41 H8 Z" fill="${u('b')}" stroke="#4b535c" stroke-width="1"/>${hl('M14 10 H26 L14 22 Z', 0.3)}` })),
});

// ---- Version 172: Memory-Symbole (klar unterscheidbar: Form + Farbe) ----
Object.assign(ICONS, {
  board: mk('0 0 48 48', false, () => ({ defs: '', body: board(24, 24, 19) })),
  flight: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('f', [[0, '#8fd8ff'], [0.5, '#2a86e8'], [1, '#14469c']]),
    body: `<path d="M24 45 L5 17 L11 3 L24 11 L37 3 L43 17 Z" fill="${u('f')}" stroke="#0d2f6e" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M24 11 V45" stroke="#0d2f6e" stroke-width="1.8"/><path d="M11 3 L24 45 M37 3 L24 45" stroke="#0d2f6e" stroke-width=".8" opacity=".5"/>
      <rect x="22.2" y="38" width="3.6" height="8" rx="1" fill="#5e666f"/><path d="M14 12 L21 24" stroke="#fff" stroke-width="2" opacity=".55"/>` })),
  one80: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('r', [[0, '#ff6b5e'], [0.5, '#e2231a'], [1, '#9c0e08']]),
    body: `<rect x="2" y="9" width="44" height="30" rx="8" fill="${u('r')}" stroke="#5a0805" stroke-width="1.4"/>
      <text x="24" y="32.5" text-anchor="middle" font-family="Arial Black, Arial" font-weight="900" font-size="19" fill="#fff" stroke="#5a0805" stroke-width=".8" paint-order="stroke">180</text>${hl('M6 12 H42 C43 12 43 13 43 14 V18 H5 V14 C5 13 5 12 6 12 Z', 0.3)}` })),
  chalk: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('w', [[0, '#d39a62'], [1, '#7f4c22']]) + L('s', [[0, '#3a4a42'], [1, '#1d2824']]),
    body: `<rect x="2" y="5" width="44" height="38" rx="3" fill="${u('w')}" stroke="#5a3415" stroke-width="1"/><rect x="6" y="9" width="36" height="30" rx="1.5" fill="${u('s')}"/>
      <text x="24" y="31" text-anchor="middle" font-family="Comic Sans MS, Segoe Print, cursive" font-weight="700" font-size="16" fill="#f4f4f0" opacity=".95">501</text>
      <path d="M11 14 H20" stroke="#f4f4f0" stroke-width="1.2" opacity=".5"/><rect x="31" y="40" width="9" height="3" rx="1" fill="#f4f4f0"/>` })),
});
export const icon = name => (ICONS[name] ?? ICONS.home)();
export const ICON_NAMES = Object.keys(ICONS);

// ---- Version 173: restliche Emojis als eigene Icons (Sponsoren-Branchen, Spielmomente, Einzelfälle, Pfeile, Fans) ----
const tri = (left, stops) => mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('p', stops),
  body: `<path d="${left ? 'M38 7 L10 24 L38 41 Z' : 'M10 7 L38 24 L10 41 Z'}" fill="${u('p')}" stroke="#1d5a12" stroke-width="1.6" stroke-linejoin="round"/>${hl(left ? 'M35 11 L16 23 L35 19 Z' : 'M13 11 L32 23 L13 19 Z', 0.4)}` }));
const GREEN = [[0, '#b6f08c'], [0.5, '#52b638'], [1, '#2f8a22']];
Object.assign(ICONS, {
  triL: tri(true, GREEN), triR: tri(false, GREEN),
  // Fans: jubelnde Silhouetten mit erhobenen Armen (vorn dunkel, hinten heller)
  fans: mk('0 0 56 48', true, ({ L, u }) => {
    const fan = (x, y, s, f, st) => `<g transform="translate(${x} ${y}) scale(${s})">
      <path d="M-5 -2 L-10 -15 M5 -2 L10 -15" stroke="${f}" stroke-width="4.2" stroke-linecap="round" fill="none"/>
      <path d="M-8.5 16 V3 C-8.5 -1.5 -5 -3 0 -3 C5 -3 8.5 -1.5 8.5 3 V16 Z" fill="${f}" stroke="${st}" stroke-width=".7"/>
      <circle cx="0" cy="-9" r="5" fill="${f}" stroke="${st}" stroke-width=".7"/></g>`;
    return { defs: L('a', [[0, '#9aa5b2'], [1, '#5e6873']]) + L('b', [[0, '#4a535d'], [1, '#14181d']]),
      body: `${fan(15, 27, 0.85, u('a'), '#3b434b')}${fan(41, 27, 0.85, u('a'), '#3b434b')}
        ${fan(8, 36, 1, u('b'), '#000')}${fan(28, 34, 1.05, u('b'), '#000')}${fan(48, 36, 1, u('b'), '#000')}
        ${hl('M22 33 C22 30.5 24 29.5 26 29.2 C24.5 31 24 33 24 36 Z', 0.3)}` };
  }),
  hotel: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('w', [[0, '#ffd9a6'], [1, '#d98a3a']]),
    body: `<rect x="8" y="6" width="32" height="38" rx="1.5" fill="${u('w')}" stroke="#7a4310" stroke-width="1.1"/>
      ${[11, 18, 25].map(y => [12, 21.5, 31].map(x => `<rect x="${x}" y="${y}" width="5" height="4.5" fill="#bfe6ff" stroke="#5a7a99" stroke-width=".5"/>`).join('')).join('')}
      <rect x="19" y="33" width="10" height="11" fill="#7a4310"/><rect x="14" y="31" width="20" height="3" rx="1" fill="#e2382b"/><text x="24" y="10" text-anchor="middle" font-size="4" font-weight="900" fill="#7a4310" font-family="Arial">HOTEL</text>` })),
  bank: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('s', [[0, '#f6f7f8'], [1, '#aab3bd']]),
    body: `<path d="M3 16 L24 4 L45 16 Z" fill="${u('s')}" stroke="#5e666f" stroke-width="1.1" stroke-linejoin="round"/><rect x="5" y="16" width="38" height="4" fill="${u('s')}" stroke="#5e666f" stroke-width=".9"/>
      ${[9, 18, 27, 36].map(x => `<rect x="${x}" y="20" width="4" height="17" fill="${u('s')}" stroke="#5e666f" stroke-width=".8"/>`).join('')}
      <rect x="4" y="37" width="40" height="4" fill="${u('s')}" stroke="#5e666f" stroke-width=".9"/><rect x="2" y="41" width="44" height="4" rx="1" fill="${u('s')}" stroke="#5e666f" stroke-width=".9"/>
      <circle cx="24" cy="12" r="2.6" fill="#ffc928" stroke="#8a5a00" stroke-width=".6"/>` })),
  headphones: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('c', [[0, '#ff7a6b'], [1, '#a8150c']]),
    body: `<path d="M7 30 V24 C7 13 15 6 24 6 C33 6 41 13 41 24 V30" fill="none" stroke="#2a3038" stroke-width="4.4"/><path d="M8.5 26 V24 C8.5 14 15.5 7.8 24 7.8" fill="none" stroke="#fff" stroke-width="1" opacity=".35"/>
      <rect x="4" y="25" width="11" height="17" rx="4.5" fill="${u('c')}" stroke="#5a0b05" stroke-width="1"/><rect x="33" y="25" width="11" height="17" rx="4.5" fill="${u('c')}" stroke="#5a0b05" stroke-width="1"/>
      ${hl('M6 28 C6 26.5 7 26 8.5 26 V39 C7 39 6 38 6 36.5 Z', 0.4)}${hl('M35 28 C35 26.5 36 26 37.5 26 V39 C36 39 35 38 35 36.5 Z', 0.4)}` })),
  plug: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('p', [[0, '#5a6470'], [1, '#1d2228']]) + L('m', STEEL, 1, 0),
    body: `<rect x="17" y="3" width="4" height="12" rx="1" fill="${u('m')}" stroke="#4b535c" stroke-width=".6"/><rect x="27" y="3" width="4" height="12" rx="1" fill="${u('m')}" stroke="#4b535c" stroke-width=".6"/>
      <path d="M11 14 H37 V24 C37 31 31 35 24 35 C17 35 11 31 11 24 Z" fill="${u('p')}" stroke="#0b0d10" stroke-width="1"/><path d="M24 35 V40 C24 44 30 45 34 45" fill="none" stroke="#1d2228" stroke-width="3.4" stroke-linecap="round"/>${hl('M14 16 H19 V26 C17 25 14 23 14 20 Z', 0.3)}` })),
  croissant: mk('0 0 56 48', true, ({ L, u }) => ({ defs: L('c', [[0, '#ffd98a'], [0.5, '#e89a3a'], [1, '#a8601a']]),
    body: `<path d="M4 34 C2 26 8 22 12 23 L16 13 C22 9 34 9 40 13 L44 23 C48 22 54 26 52 34 C48 36 44 32 42 30 C36 27 20 27 14 30 C12 32 8 36 4 34 Z" fill="${u('c')}" stroke="#7a4310" stroke-width="1.1" stroke-linejoin="round"/>
      <path d="M16 13 C18 19 18 24 17 28.5 M28 10 C28.5 17 28.5 22 28 27 M40 13 C38 19 38 24 39 28.5" fill="none" stroke="#7a4310" stroke-width="1.1" opacity=".7"/>${hl('M18 13 C22 11 26 10.5 27 11 C25 15 22 16 19 18 Z', 0.4)}` })),
  burger: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('b', [[0, '#ffc870'], [1, '#c67a22']]) + L('m', [[0, '#8a4a22'], [1, '#4a2410']]),
    body: `<path d="M5 21 C5 10 14 5 24 5 C34 5 43 10 43 21 Z" fill="${u('b')}" stroke="#8a4a12" stroke-width="1"/>${[[14, 11], [22, 9], [30, 11], [19, 15], [27, 15], [35, 15]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="1.4" ry=".8" fill="#fff5d6"/>`).join('')}
      <path d="M4 22 H44 L41 26 L37 23.5 L33 26 L29 23.5 L25 26 L21 23.5 L17 26 L13 23.5 L9 26 Z" fill="#5ad65a" stroke="#2a7a2a" stroke-width=".7"/>
      <path d="M5 25 H43 V27 H5 Z" fill="#ffc928"/><rect x="5" y="27" width="38" height="7" rx="3.2" fill="${u('m')}" stroke="#2e1408" stroke-width=".9"/>
      <path d="M5 36 H43 C43 41 39 43 34 43 H14 C9 43 5 41 5 36 Z" fill="${u('b')}" stroke="#8a4a12" stroke-width="1"/>${hl('M9 18 C10 12 15 8.5 21 8 C15 11 12 14 11.5 19 Z', 0.45)}` })),
  candy: mk('0 0 56 48', true, ({ L, R, u }) => ({ defs: R('c', [[0, '#ffb0d6'], [1, '#d4237a']]),
    body: `<path d="M17 24 L4 14 L6 24 L4 34 Z M39 24 L52 14 L50 24 L52 34 Z" fill="#ff8ac4" stroke="#8a1150" stroke-width="1" stroke-linejoin="round"/>
      <circle cx="28" cy="24" r="12" fill="${u('c')}" stroke="#8a1150" stroke-width="1.1"/><path d="M19 17 C25 21 25 28 21 32 M28 12 C34 18 34 30 28 36 M37 17 C31 21 31 28 35 32" fill="none" stroke="#fff" stroke-width="1.6" opacity=".7"/>${hl('M20 19 C22 15 26 13.5 29 13.5 C25 16 23 18 22 22 Z', 0.55)}` })),
  sofa: mk('0 0 56 48', true, ({ L, u }) => ({ defs: L('s', [[0, '#8fc6ff'], [1, '#2459b8']]) + L('d', [[0, '#5a8fe0'], [1, '#183f8a']]),
    body: `<path d="M10 12 C10 9 12 8 15 8 H41 C44 8 46 9 46 12 V26 H10 Z" fill="${u('s')}" stroke="#13306e" stroke-width="1.1"/><path d="M28 9 V26" stroke="#13306e" stroke-width=".9" opacity=".6"/>
      <rect x="10" y="25" width="36" height="9" rx="2.5" fill="${u('s')}" stroke="#13306e" stroke-width="1"/><path d="M28 25 V34" stroke="#13306e" stroke-width=".9" opacity=".6"/>
      <rect x="3" y="18" width="9" height="20" rx="4" fill="${u('d')}" stroke="#13306e" stroke-width="1"/><rect x="44" y="18" width="9" height="20" rx="4" fill="${u('d')}" stroke="#13306e" stroke-width="1"/>
      <path d="M8 38 V43 M48 38 V43" stroke="#7f4c22" stroke-width="3" stroke-linecap="round"/>${hl('M13 11 C13 10 14 9.8 15 9.8 H26 V14 H13 Z', 0.35)}` })),
  piano: mk('0 0 56 48', true, ({ L, u }) => ({ defs: L('k', [[0, '#ffffff'], [1, '#d7dde4']]) + L('b', [[0, '#3a4148'], [1, '#0b0d10']]),
    body: `<rect x="2" y="8" width="52" height="32" rx="3" fill="${u('b')}" stroke="#000" stroke-width="1"/><rect x="5" y="16" width="46" height="21" fill="${u('k')}" stroke="#7d8896" stroke-width=".6"/>
      ${Array.from({ length: 9 }, (_, i) => `<path d="M${5 + (i + 1) * 46 / 10} 16 V37" stroke="#7d8896" stroke-width=".7"/>`).join('')}
      ${[1, 2, 4, 5, 6, 8, 9].map(i => `<rect x="${5 + i * 4.6 - 1.5}" y="16" width="3" height="12" rx=".5" fill="#14181d"/>`).join('')}${hl('M5 10 H51 V12.5 H5 Z', 0.2)}` })),
  sweat: mk('0 0 48 48', false, ({ L, u }) => {
    const drop = (x, y, s) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -12 C4 -5 8 -1 8 4 C8 9 4 12 0 12 C-4 12 -8 9 -8 4 C-8 -1 -4 -5 0 -12 Z" fill="${u('d')}" stroke="#14469c" stroke-width="1.1"/>
      <path transform="translate(${x} ${y}) scale(${s})" d="M-4 3 C-4 0 -2.5 -2 -1 -3.5 C-2 0 -2 2 -1.5 5 Z" fill="#fff" opacity=".7"/>`;
    return { defs: L('d', [[0, '#c4ecff'], [1, '#2a86e8']]), body: drop(16, 26, 1.3) + drop(35, 15, 0.9) + drop(35, 37, 0.75) };
  }),
  notes: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('n', [[0, '#c48bff'], [1, '#4a1a9c']]),
    body: `<path d="M17 36 V10 L41 4 V30" fill="none" stroke="#2a0f60" stroke-width="3.6" stroke-linejoin="round"/><path d="M17 10 L41 4 V11 L17 17 Z" fill="${u('n')}" stroke="#2a0f60" stroke-width=".8"/>
      <ellipse cx="12" cy="37" rx="6.5" ry="5" fill="${u('n')}" stroke="#2a0f60" stroke-width="1" transform="rotate(-20 12 37)"/><ellipse cx="36" cy="31" rx="6.5" ry="5" fill="${u('n')}" stroke="#2a0f60" stroke-width="1" transform="rotate(-20 36 31)"/>
      ${hl('M8 36 C8.5 34 10.5 33 12.5 33 C11 34.5 10 35.5 9.5 37.5 Z', 0.6)}${hl('M32 30 C32.5 28 34.5 27 36.5 27 C35 28.5 34 29.5 33.5 31.5 Z', 0.6)}` })),
  pin: mk('0 0 48 48', false, ({ R, u }) => ({ defs: R('r', [[0, '#ff9a8a'], [1, '#b8160c']]),
    body: `<path d="M22 26 L8 44" stroke="#8c96a2" stroke-width="2.6" stroke-linecap="round"/><path d="M14 21 L27 34 L31 30 L18 17 Z" fill="#c4271c" stroke="#6e0d07" stroke-width="1"/>
      <path d="M21 24 L32 13 L35 16 L24 27 Z" fill="#e2382b" stroke="#6e0d07" stroke-width=".9"/><circle cx="34" cy="14" r="10" fill="${u('r')}" stroke="#6e0d07" stroke-width="1.1"/>${hl('M28 11 C29 7.5 32 6 35 6 C32 8 30.5 10 30 13 Z', 0.65)}` })),
  milk: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('g', [[0, '#eaf6ff'], [1, '#b8cad8']], 1, 0),
    body: `<path d="M11 5 H37 L34 44 H14 Z" fill="${u('g')}" fill-opacity=".55" stroke="#7d8896" stroke-width="1.2" stroke-linejoin="round"/>
      <path d="M12.3 14 C18 16 30 12 35.7 14 L34 44 H14 Z" fill="#ffffff" stroke="#c9d3dc" stroke-width=".6"/><ellipse cx="24" cy="5" rx="13" ry="1.8" fill="none" stroke="#7d8896" stroke-width="1"/>
      ${hl('M15 8 H18 L17 40 H15.5 Z', 0.6)}` })),
  thumbDown: mk('0 0 48 48', false, ({ R, u }) => ({ defs: R('s', [[0, '#ffe2c4'], [1, '#e2a273']]),
    body: `<g transform="rotate(180 24 24)"><rect x="4" y="21" width="9" height="22" rx="2" fill="#2a74c9" stroke="#13306e" stroke-width="1"/>
      <path d="M13 23 L20 12 C21 9 21 6 23 4 C26 3 28 5 28 8 C28 12 26 15 25 19 H39 C42 19 44 21 43.5 24 C44.5 25.5 44.5 27.5 43 29 C44 30.5 43.5 33 42 34 C42.5 36 41.5 38.5 39 39 C38 42 36 43 33 43 H13 Z" fill="${u('s')}" stroke="#a0623a" stroke-width="1.1" stroke-linejoin="round"/>
      <path d="M33 24 H43 M33 29 H42 M33 34 H41" stroke="#a0623a" stroke-width=".9" opacity=".7"/></g>` })),
  sos: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('r', [[0, '#ff6b5e'], [0.5, '#e2231a'], [1, '#9c0e08']]),
    body: `<rect x="3" y="9" width="42" height="30" rx="6" fill="${u('r')}" stroke="#5a0805" stroke-width="1.4"/>
      <text x="24" y="31" text-anchor="middle" font-family="Arial Black, Arial" font-weight="900" font-size="16" fill="#fff" stroke="#5a0805" stroke-width=".7" paint-order="stroke">SOS</text>${hl('M7 12 H41 C42 12 42 13 42 14 V18 H6 V14 C6 13 6 12 7 12 Z', 0.3)}` })),
  pasta: mk('0 0 56 48', true, ({ L, u }) => ({ defs: L('p', [[0, '#fff0a8'], [1, '#e8b030']]) + L('t', [[0, '#ff6b4a'], [1, '#b8200c']]),
    body: `<path d="M34 2 L30 24 M41 3 L33 25" stroke="#9aa3ad" stroke-width="2" stroke-linecap="round"/>
      <path d="M12 22 C14 12 22 15 26 13 C30 11 36 12 40 16 C46 16 46 22 44 24 Z" fill="${u('p')}" stroke="#a87412" stroke-width=".9"/>
      <path d="M15 20 C18 15 22 19 25 15 C28 12 31 18 35 14 C38 13 40 18 42 19" fill="none" stroke="#c48a1a" stroke-width="1"/><ellipse cx="28" cy="17" rx="7" ry="3.2" fill="${u('t')}"/><circle cx="25" cy="15.5" r="1.6" fill="#2e9c3a"/>
      <path d="M3 22 H53 C53 34 43 40 28 40 C13 40 3 34 3 22 Z" fill="#ffffff" stroke="#7d8896" stroke-width="1.2"/><path d="M5 24 H51" stroke="#2a74c9" stroke-width="1.6"/>${hl('M8 27 C11 33 17 36 24 37 C16 37 10 33 8 27 Z', 0.4)}` })),
  extinguisher: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('r', [[0, '#ff7a6b'], [0.5, '#e2231a'], [1, '#8a0e08']], 1, 0),
    body: `<path d="M20 6 H28 L29 10 H19 Z" fill="#2a3038"/><path d="M16 4 H30 L33 6 H16 Z" fill="#2a3038"/><path d="M30 6 C38 6 40 10 40 16" fill="none" stroke="#1d2228" stroke-width="2.4" stroke-linecap="round"/><path d="M38 15 L42 21 L36 19 Z" fill="#1d2228"/>
      <rect x="14" y="10" width="20" height="35" rx="8" fill="${u('r')}" stroke="#5a0805" stroke-width="1.1"/><rect x="17" y="21" width="14" height="10" rx="1.5" fill="#f4f4f0" stroke="#5a0805" stroke-width=".6"/><path d="M19 24 H29 M19 27.5 H26" stroke="#7d8896" stroke-width="1"/>${hl('M16.5 16 C16.5 13.5 18 12.5 19.5 12.5 V40 C17.5 39 16.5 38 16.5 36 Z', 0.4)}` })),
  salad: mk('0 0 56 48', true, ({ L, u }) => ({ defs: L('b', [[0, '#e7c38e'], [1, '#9c6a2a']]),
    body: `<path d="M9 24 C6 14 14 10 18 13 C20 6 30 6 32 12 C36 8 46 11 45 18 C50 19 49 25 47 26 Z" fill="#4fb335" stroke="#1d5a12" stroke-width="1"/><path d="M14 20 C18 15 22 16 24 20 M28 14 C32 15 34 18 33 22 M38 17 C42 18 43 21 42 24" fill="none" stroke="#a6ec7a" stroke-width="1.4"/>
      <circle cx="21" cy="18" r="4" fill="#e2382b" stroke="#7a0e06" stroke-width=".7"/><circle cx="36" cy="20" r="3.4" fill="#e2382b" stroke="#7a0e06" stroke-width=".7"/><ellipse cx="29" cy="22" rx="4" ry="2.4" fill="#f4f4f0" stroke="#2e9c3a" stroke-width="1"/>
      <path d="M3 24 H53 C53 35 43 42 28 42 C13 42 3 35 3 24 Z" fill="${u('b')}" stroke="#5e3a10" stroke-width="1.2"/>${hl('M8 27 C11 33 17 37 24 38 C16 38 10 34 8 27 Z', 0.35)}` })),
});

// ---- Version 176: Einsatz-Herzen in Gelb (1) und Orange (2), Rot (3) = heart ----
Object.assign(ICONS, {
  heartY: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('h', [[0, '#fff27a'], [1, '#e8b400']]),
    body: `<path d="${heartPath}" fill="${u('h')}" stroke="#9c7400" stroke-width="1.2"/><ellipse cx="15" cy="13" rx="6" ry="3.6" fill="#fff" opacity=".5"/>` })),
  heartO: mk('0 0 48 48', false, ({ L, u }) => ({ defs: L('h', [[0, '#ffc07a'], [1, '#e86a00']]),
    body: `<path d="${heartPath}" fill="${u('h')}" stroke="#9c4200" stroke-width="1.2"/><ellipse cx="15" cy="13" rx="6" ry="3.6" fill="#fff" opacity=".5"/>` })),
});
