// Eigene Icons (Version 168, Nutzerwunsch: weniger Emojis) – Glanzverlauf, dunkle Kontur, heller Lichtreflex wie Pfeil/Haken in frame.js.
// Größe in em → passt sich der jeweiligen Schriftgröße an (wie die bisherigen Emojis). icon(name) liefert das SVG als String.
const O = '#1b2433';                                   // Kontur
const g = (id, a, b, c = null) => `<linearGradient id="ni-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/>${c ? `<stop offset=".5" stop-color="${b}"/><stop offset="1" stop-color="${c}"/>` : `<stop offset="1" stop-color="${b}"/>`}</linearGradient>`;
const svg = (defs, body) => `<svg class="nsd-ico" viewBox="0 0 48 48" aria-hidden="true"><defs>${defs}</defs><g stroke="${O}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`;
const shine = d => `<path d="${d}" fill="#fff" stroke="none" opacity=".35"/>`;

const ICONS = {
  // Start: Haus mit rotem Dach
  home: () => svg(g('roof', '#ff8a7a', '#e2382b', '#a8180f') + g('wall', '#fff8e6', '#e9dcc0'),
    `<rect x="31" y="9" width="5" height="9" fill="#9c5a3c"/><rect x="11" y="22" width="26" height="20" fill="url(#ni-wall)"/>
     <path d="M5 25 L24 7 L43 25 Z" fill="url(#ni-roof)"/><rect x="20.5" y="30" width="7" height="12" fill="#8a4b2a"/>
     <rect x="13.5" y="27" width="5" height="5" fill="#9fd6ff"/><rect x="29.5" y="27" width="5" height="5" fill="#9fd6ff"/>${shine('M10 23 L24 10 L30 15 L13 26 Z')}`),
  // Ranglisten: Pokal
  ranks: () => svg(g('cup', '#fff3a0', '#ffc928', '#d98a00'),
    `<path d="M14 10 C5 10 6 22 15 23 M34 10 C43 10 42 22 33 23" fill="none" stroke-width="6"/><path d="M14 10 C5 10 6 22 15 23 M34 10 C43 10 42 22 33 23" fill="none" stroke="#ffc928" stroke-width="2.6"/>
     <path d="M13 6 H35 V16 C35 25 30 29 24 29 C18 29 13 25 13 16 Z" fill="url(#ni-cup)"/>
     <rect x="21" y="29" width="6" height="6" fill="url(#ni-cup)"/><rect x="14" y="35" width="20" height="7" rx="1.5" fill="#6b3f1f"/>
     <rect x="18" y="37" width="12" height="3" fill="#ffd34d" stroke-width="1"/>${shine('M16 8 H21 V18 C21 22 22 25 24 27 C18 26 16 22 16 17 Z')}`),
  // Fähigkeit: Dartscheibe mit steckendem Dart
  skill: () => svg(g('fl', '#7fd3ff', '#1e6fd9'),
    `<circle cx="22" cy="26" r="19" fill="#20262e"/><circle cx="22" cy="26" r="15.5" fill="#d8323a" stroke-width="1.2"/>
     <circle cx="22" cy="26" r="12.5" fill="#f3e6c4" stroke-width="1.2"/><circle cx="22" cy="26" r="8.5" fill="#2e9c3a" stroke-width="1.2"/>
     <circle cx="22" cy="26" r="5.5" fill="#f3e6c4" stroke-width="1.2"/><circle cx="22" cy="26" r="2.5" fill="#d8323a" stroke-width="1.2"/>
     <path d="M23 25 L34 14" stroke="#c9ced3" stroke-width="2.6"/><path d="M33 15 L39 9" stroke="#8d969f" stroke-width="4"/>
     <path d="M38 10 L46 4 L44 13 Z M38 10 L36 2 L45 4 Z" fill="url(#ni-fl)" stroke-width="1.4"/>`),
  // Leben: zwei Personen
  life: () => svg(g('p1', '#8fd0ff', '#2a74c9') + g('p2', '#9cf07a', '#2f9a2a'),
    `<circle cx="31" cy="13" r="6.5" fill="url(#ni-p1)"/><path d="M19 38 C19 27 24 22 31 22 C38 22 43 27 43 38 Z" fill="url(#ni-p1)"/>
     <circle cx="18" cy="17" r="7.5" fill="url(#ni-p2)"/><path d="M4 44 C4 32 10 27 18 27 C26 27 32 32 32 44 Z" fill="url(#ni-p2)"/>
     ${shine('M13 13 C14 10 17 9 19 10 C16 11 15 13 14 15 Z')}${shine('M8 40 C8 34 11 31 15 30 C12 33 11 36 11 40 Z')}`),
  // Getränke: Bierkrug mit Schaum
  beer: () => svg(g('beer', '#ffe27a', '#f0a81b', '#c97a00'),
    `<path d="M33 18 H38 C42 18 42 34 38 34 H33" fill="none" stroke-width="3.2"/><rect x="9" y="15" width="25" height="28" rx="3" fill="url(#ni-beer)"/>
     <path d="M7 16 C5 9 12 6 15 9 C17 4 25 4 27 9 C31 6 37 9 35 16 C34 19 8 19 7 16 Z" fill="#fffdf4"/>
     <path d="M15 22 V38 M21.5 22 V38 M28 22 V38" stroke="#fff" stroke-width="1.6" opacity=".55"/>`),
  // Schnaps- und Cocktailglas (klein, für Vorratsanzeigen)
  shot: () => svg(g('shot', '#fff1c9', '#e8b24a'),
    `<path d="M12 10 H36 L32 42 H16 Z" fill="#eef7ff" opacity=".9"/><path d="M14.5 22 H33.5 L32 42 H16 Z" fill="url(#ni-shot)"/>${shine('M15 12 H19 L17.5 38 H16.8 Z')}`),
  cocktail: () => svg(g('ck', '#c9f5ff', '#3bb3d6'),
    `<path d="M6 8 H42 L24 27 Z" fill="url(#ni-ck)"/><path d="M24 27 V41 M15 42 H33" stroke-width="2.6"/>
     <circle cx="33" cy="9" r="4" fill="#3cb043"/><path d="M33 9 L38 2" stroke-width="1.6"/>${shine('M10 10 H20 L22 14 H14 Z')}`),
  // Darts: kompletter Pfeil schräg
  darts: () => svg(g('fl2', '#ff8a7a', '#c4161c') + g('brl', '#f1f3f5', '#9aa3ad', '#4b535c'),
    `<g transform="rotate(-45 24 24)"><path d="M2 24 H9" stroke="#c9ced3" stroke-width="2.4"/><rect x="9" y="19.5" width="17" height="9" rx="3.5" fill="url(#ni-brl)"/>
     <path d="M12.5 20 V28 M16 20 V28 M19.5 20 V28" stroke-width="1.1" opacity=".65"/><path d="M26 24 H34" stroke="#59616a" stroke-width="3"/>
     <path d="M32 24 L42 11 L47 12 L44 24 Z M32 24 L42 37 L47 36 L44 24 Z" fill="url(#ni-fl2)"/><path d="M32 24 H46" stroke-width="1.6"/></g>`),
  // Shop: Einkaufstasche
  shop: () => svg(g('bag', '#ffb36b', '#f0701e', '#c4480b'),
    `<path d="M17 17 V12 C17 4 31 4 31 12 V17" fill="none" stroke-width="2.8"/><path d="M8 15 H40 L37 43 H11 Z" fill="url(#ni-bag)"/>
     <circle cx="17" cy="20" r="1.8" fill="${O}"/><circle cx="31" cy="20" r="1.8" fill="${O}"/>
     <path d="M24 26 l2.2 4.6 5 .6 -3.7 3.4 1 5 -4.5 -2.5 -4.5 2.5 1 -5 -3.7 -3.4 5 -.6 Z" fill="#fff3a0" stroke-width="1.2"/>${shine('M10 17 H15 L13 39 H12 Z')}`),
  // Spielplan: Kalenderblatt
  calendar: () => svg(g('cal', '#ff7a6b', '#d02c22'),
    `<rect x="6" y="9" width="36" height="34" rx="3" fill="#fbfbf7"/><path d="M6 12 C6 10 7 9 9 9 H39 C41 9 42 10 42 12 V19 H6 Z" fill="url(#ni-cal)"/>
     <path d="M15 5 V13 M33 5 V13" stroke-width="3"/>
     ${[0, 1, 2].map(r => [0, 1, 2, 3].map(c => `<rect x="${11 + c * 7}" y="${23 + r * 6}" width="4" height="3.5" fill="${r === 1 && c === 2 ? '#d02c22' : '#9aa6b5'}" stroke="none"/>`).join('')).join('')}`),
  // News: Zeitung
  news: () => svg(g('np', '#ffffff', '#dfe4ea'),
    `<path d="M10 8 H42 V38 C42 41 40 43 37 43 H8 C5 43 4 41 4 38 V16 H10 Z" fill="url(#ni-np)"/><path d="M10 16 V38 C10 41 8 43 6 43" fill="none"/>
     <rect x="15" y="13" width="22" height="7" fill="#2b3a55" stroke="none"/>
     <path d="M15 25 H25 M15 30 H25 M15 35 H25 M29 25 H37 M29 30 H37 M29 35 H37" stroke="#7d8896" stroke-width="2"/>`),
  // Statistik: Klemmbrett mit Balken
  stats: () => svg(g('clip', '#c78a55', '#8a5427'),
    `<rect x="8" y="7" width="32" height="38" rx="3" fill="url(#ni-clip)"/><rect x="12" y="12" width="24" height="29" fill="#fbfbf7" stroke-width="1.4"/>
     <rect x="18" y="4" width="12" height="7" rx="2" fill="#c9ced3"/>
     <rect x="15" y="31" width="4" height="7" fill="#2e9c3a" stroke-width="1.2"/><rect x="22" y="24" width="4" height="14" fill="#2a74c9" stroke-width="1.2"/><rect x="29" y="18" width="4" height="20" fill="#d8323a" stroke-width="1.2"/>`),
  // Team: Aktenkoffer
  team: () => svg(g('case', '#a8744a', '#6b4224'),
    `<path d="M18 13 V9 C18 7 19 6 21 6 H27 C29 6 30 7 30 9 V13" fill="none" stroke-width="2.8"/><rect x="5" y="13" width="38" height="28" rx="4" fill="url(#ni-case)"/>
     <path d="M5 24 H43" stroke-width="1.6"/><rect x="21" y="21" width="6" height="6" rx="1" fill="#ffd34d"/>${shine('M8 15 H40 V19 H8 Z')}`),
  // Sponsoren: Münzstapel + Münze
  sponsors: () => svg(g('coin', '#ffd34d', '#c98200') + g('coin2', '#fff6b8', '#ffc928'),
    `<path d="M6 33 V38 C6 44 30 44 30 38 V33" fill="url(#ni-coin)"/><ellipse cx="18" cy="33" rx="12" ry="4.5" fill="url(#ni-coin2)"/><path d="M6 26 V31 C6 37 30 37 30 31 V26" fill="url(#ni-coin)"/><ellipse cx="18" cy="26" rx="12" ry="4.5" fill="url(#ni-coin2)"/><path d="M6 19 V24 C6 30 30 30 30 24 V19" fill="url(#ni-coin)"/><ellipse cx="18" cy="19" rx="12" ry="4.5" fill="url(#ni-coin2)"/>
     <circle cx="35" cy="20" r="10" fill="url(#ni-coin2)"/><circle cx="35" cy="20" r="6.5" fill="none" stroke-width="1.2" opacity=".6"/>
     <path d="M35 15.5 l1.4 3 3.3 .4 -2.4 2.2 .6 3.3 -2.9 -1.6 -2.9 1.6 .6 -3.3 -2.4 -2.2 3.3 -.4 Z" fill="#fff" stroke-width="1"/>`),
  // Tourcard: Schild mit Stern
  card: () => svg(g('sh', '#e9f4ff', '#9fb8d6', '#5d7ea6'),
    `<path d="M24 4 L41 10 V22 C41 33 33 40 24 44 C15 40 7 33 7 22 V10 Z" fill="url(#ni-sh)"/>
     <path d="M24 13 l3.2 6.6 7.2 .9 -5.3 5 1.4 7.2 -6.5 -3.6 -6.5 3.6 1.4 -7.2 -5.3 -5 7.2 -.9 Z" fill="#ffd34d" stroke-width="1.4"/>${shine('M10 12 L24 7 V14 L12 18 Z')}`),
  // Optionen: Zahnrad
  gear: () => svg(g('gear', '#e7ebef', '#9aa3ad', '#5b636c'),
    `<path d="${Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4, p = (r, d) => `${(24 + r * Math.cos(a + d)).toFixed(1)} ${(24 + r * Math.sin(a + d)).toFixed(1)}`;
      return `${i ? 'L' : 'M'}${p(14, -0.22)} L${p(20, -0.16)} L${p(20, 0.16)} L${p(14, 0.22)}`; }).join(' ')} Z" fill="url(#ni-gear)"/>
     <circle cx="24" cy="24" r="6" fill="#2b3340"/>`),
};
export const icon = name => (ICONS[name] ?? ICONS.home)();
export const ICON_NAMES = Object.keys(ICONS);
