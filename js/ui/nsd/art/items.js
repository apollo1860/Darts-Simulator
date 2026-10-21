// Lifestyle-Gegenstände als eigene Illustrationen (100 × 100)
import { art, BOX, shadow, OUT } from './core.js';

const SKIN = ['#ffd7b0', '#f0a874'];

export const ITEM_ART = {
  dartscheibe: () => art('dartscheibe', BOX, () => {
    const C = 2 * Math.PI, ring = (r, w, base, dash) => { const l = (C * r / 20).toFixed(2);
      return `<circle cx="50" cy="48" r="${r}" fill="none" stroke="${base}" stroke-width="${w}"/><circle cx="50" cy="48" r="${r}" fill="none" stroke="${dash}" stroke-width="${w}" stroke-dasharray="${l} ${l}" transform="rotate(-99 50 48)"/>`; };
    return `${shadow(50, 94, 34, 3.5)}<circle cx="50" cy="48" r="46" fill="#14161a" stroke="#000" stroke-width="1.5"/>
      ${ring(38, 4.2, '#1f9a49', '#d92b2b')}${ring(31, 10, '#f1e2b8', '#17181c')}${ring(24, 4.2, '#1f9a49', '#d92b2b')}${ring(15, 14, '#f1e2b8', '#17181c')}
      <circle cx="50" cy="48" r="8" fill="#1f9a49"/><circle cx="50" cy="48" r="3.6" fill="#d92b2b"/>
      ${Array.from({ length: 20 }, (_, i) => `<line x1="50" y1="48" x2="50" y2="${48 - 41}" stroke="#aeb4bb" stroke-width=".5" transform="rotate(${i * 18 + 9} 50 48)"/>`).join('')}
      <ellipse cx="36" cy="26" rx="22" ry="10" fill="#fff" opacity=".1" transform="rotate(-30 36 26)"/>`;
  }),

  taetowierung: () => art('taetowierung', BOX, ({ lin }) => `${shadow(50, 94, 38, 3)}
    <path d="M30 36 L56 36 L58 54 C68 40 84 38 92 44 C99 50 99 80 90 86 C76 94 50 94 36 88 C26 84 24 62 30 36Z" fill="${lin('arm', SKIN)}" stroke="#b9743c" stroke-width="1.4"/>
    <rect x="25" y="8" width="36" height="32" rx="10" fill="${lin('fist', SKIN)}" stroke="#b9743c" stroke-width="1.4"/>
    <path d="M32 24 V38 M40 22 V38 M48 22 V38" stroke="#b9743c" stroke-width="1.4" stroke-linecap="round"/><path d="M26 22 Q22 26 28 32" fill="none" stroke="#b9743c" stroke-width="1.4"/>
    <g stroke="#1b1b22" stroke-width="3.6" stroke-linecap="round"><path d="M34 52 L52 58"/><path d="M33 60 L51 66"/><path d="M40 48 L38 74"/><path d="M48 52 L46 76"/></g>
    <path d="M60 54 C72 48 86 50 94 58" fill="none" stroke="#fff" stroke-width="2" opacity=".35" stroke-linecap="round"/>`),

  handy: () => art('handy', BOX, ({ lin }) => {
    const cols = ['#ff6b6b', '#ffd23f', '#4ecb71', '#3fa7ff', '#b678ff', '#ff9f43', '#2ed3c6', '#ff6bb5'];
    return `${shadow(50, 94, 26, 3)}<g transform="rotate(-14 50 50)"><rect x="29" y="6" width="42" height="86" rx="9" fill="${lin('b', ['#7e8794', '#262a31', '#4d5560'])}" stroke="#0e1014" stroke-width="1.5"/>
      <rect x="33" y="14" width="34" height="62" rx="3" fill="${lin('s', ['#2b5dbb', '#0e1f4a'])}"/>
      ${Array.from({ length: 20 }, (_, i) => `<rect x="${35 + (i % 4) * 8}" y="${17 + Math.floor(i / 4) * 11.5}" width="6" height="7" rx="1.6" fill="${cols[(i * 3) % 8]}"/>`).join('')}
      <circle cx="50" cy="84" r="3.6" fill="#171a20" stroke="#8d96a3" stroke-width=".8"/><rect x="43" y="9.5" width="14" height="1.8" rx=".9" fill="#101216"/>
      <path d="M33 14 H55 L40 40 H33Z" fill="#fff" opacity=".13"/></g>`;
  }),

  spielekonsole: () => art('spielekonsole', BOX, ({ lin }) => `${shadow(50, 84, 42, 3.5)}
    <path d="M6 44 Q6 26 24 26 H76 Q94 26 94 44 V58 Q94 74 78 74 H22 Q6 74 6 58Z" fill="${lin('c', ['#454b57', '#15171c'])}" stroke="#05060a" stroke-width="1.6"/>
    <rect x="26" y="32" width="48" height="36" rx="3" fill="#0a0c12" stroke="#2e3340" stroke-width="1.2"/>
    <rect x="28" y="34" width="44" height="32" rx="2" fill="${lin('s', ['#6fb3ff', '#1b3f8a', '#0e1e4a'])}"/>
    <path d="M28 34 H55 L36 66 H28Z" fill="#fff" opacity=".18"/><circle cx="50" cy="50" r="7" fill="#fff" opacity=".18"/>
    <g fill="#aeb5c0"><rect x="12" y="45" width="14" height="5" rx="1.6"/><rect x="16.5" y="40.5" width="5" height="14" rx="1.6"/></g>
    <g stroke="#0a0c10" stroke-width=".8"><circle cx="81" cy="42" r="3.2" fill="#4ecb71"/><circle cx="81" cy="56" r="3.2" fill="#3fa7ff"/><circle cx="74.5" cy="49" r="3.2" fill="#ff6b6b"/><circle cx="87.5" cy="49" r="3.2" fill="#ffd23f"/></g>
    <rect x="30" y="29" width="14" height="2.4" rx="1.2" fill="#8d96a3" opacity=".7"/><rect x="56" y="29" width="14" height="2.4" rx="1.2" fill="#8d96a3" opacity=".7"/>
    <ellipse cx="38" cy="32" rx="26" ry="3" fill="#fff" opacity=".12"/>`),

  billardtisch: () => art('billardtisch', BOX, ({ lin }) => `${shadow(50, 94, 46, 3.5)}
    <rect x="9" y="70" width="10" height="22" rx="2" fill="${lin('l1', ['#c4894a', '#8a5724'], 'h')}"/><rect x="81" y="70" width="10" height="22" rx="2" fill="${lin('l2', ['#c4894a', '#8a5724'], 'h')}"/>
    <path d="M10 40 H90 L100 68 H0Z" fill="${lin('w', ['#d99c54', '#a06a2c'])}" stroke="#5b3a14" stroke-width="1.2"/>
    <path d="M0 68 H100 V76 H0Z" fill="${lin('ap', ['#a36a2c', '#6a4216'])}"/>
    <path d="M16 45 H84 L92 64 H8Z" fill="${lin('f', ['#3a6fd0', '#1c3f94'])}" stroke="#0e2a6c" stroke-width="1"/>
    ${[[16, 45], [50, 44], [84, 45], [8, 64], [50, 66], [92, 64]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#0b0b0f"/>`).join('')}
    ${[[30, 52, '#ffd23f'], [38, 56, '#e43a3a'], [46, 51, '#222'], [56, 54, '#ff8a1f'], [64, 58, '#3fbf5a'], [70, 52, '#a33ad0'], [44, 60, '#8b1d1d'], [34, 60, '#ffd23f']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="3.1" fill="${c}"/><circle cx="${x - 1}" cy="${y - 1}" r=".9" fill="#fff" opacity=".7"/>`).join('')}
    <circle cx="24" cy="58" r="3.1" fill="#fff"/><path d="M6 78 L24 59" stroke="#e9c37a" stroke-width="2" stroke-linecap="round" opacity=".0"/>
    <path d="M30 40 L60 20" stroke="#e9c37a" stroke-width="2.2" stroke-linecap="round" opacity="0"/>`),

  laptop: () => art('laptop', BOX, ({ lin }) => `${shadow(50, 88, 44, 3.5)}
    <rect x="16" y="12" width="68" height="48" rx="4" fill="${lin('bz', ['#555d69', '#1b1e24'])}" stroke="#08090c" stroke-width="1.4"/>
    <rect x="20" y="16" width="60" height="40" rx="1.5" fill="${lin('s', ['#5ab0ff', '#2457c9', '#13307a'])}"/>
    <rect x="25" y="21" width="22" height="14" rx="1.5" fill="#fff" opacity=".85"/><rect x="50" y="21" width="25" height="3" rx="1" fill="#fff" opacity=".6"/><rect x="50" y="27" width="20" height="3" rx="1" fill="#fff" opacity=".4"/>
    <rect x="25" y="39" width="50" height="10" rx="1.5" fill="#fff" opacity=".18"/><path d="M20 16 H52 L30 56 H20Z" fill="#fff" opacity=".12"/>
    <path d="M6 64 H94 L99 78 Q99 82 94 82 H6 Q1 82 1 78Z" fill="${lin('b', ['#e6e9ee', '#9aa1ab'])}" stroke="#5f6670" stroke-width="1.2"/>
    <rect x="9" y="67" width="82" height="7" rx="1.5" fill="#6a717c" opacity=".35"/>
    ${Array.from({ length: 12 }, (_, i) => `<rect x="${11 + i * 6.7}" y="68" width="5" height="2.2" rx=".6" fill="#3b414a"/>`).join('')}${Array.from({ length: 12 }, (_, i) => `<rect x="${11 + i * 6.7}" y="71.4" width="5" height="2.2" rx=".6" fill="#3b414a"/>`).join('')}
    <rect x="40" y="76" width="20" height="4" rx="1.5" fill="#fff" opacity=".4" stroke="#7a828d" stroke-width=".6"/>`),

  spielautomat: () => art('spielautomat', BOX, ({ lin }) => `${shadow(46, 95, 30, 3)}
    <path d="M20 12 Q20 6 28 6 H66 Q74 6 74 12 V90 H20Z" fill="${lin('b', ['#ff5a4a', '#b3121c'], 'h')}" stroke="#5e0a10" stroke-width="1.6"/>
    <rect x="25" y="11" width="44" height="14" rx="3" fill="#ffd23f" stroke="#8a6a00" stroke-width="1.2"/>
    <text x="47" y="22" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="9" fill="#c4121c" textLength="38" lengthAdjust="spacingAndGlyphs">JACKPOT</text>
    <rect x="25" y="30" width="44" height="26" rx="2" fill="#10131a" stroke="#d8dde4" stroke-width="2"/>
    ${[0, 1, 2].map(i => `<rect x="${27.5 + i * 14.5}" y="32.5" width="13" height="21" rx="1.5" fill="#fff"/><text x="${34 + i * 14.5}" y="49" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="17" fill="#d9141f">7</text>`).join('')}
    <line x1="25" y1="43" x2="69" y2="43" stroke="#ffd23f" stroke-width=".8" opacity=".9"/>
    <rect x="25" y="60" width="44" height="12" rx="2" fill="#7a0d14"/><circle cx="35" cy="66" r="3.4" fill="#ffd23f"/><circle cx="47" cy="66" r="3.4" fill="#4ecb71"/><circle cx="59" cy="66" r="3.4" fill="#3fa7ff"/>
    <rect x="34" y="77" width="26" height="9" rx="2" fill="#2a0508"/><rect x="40" y="79" width="14" height="2.5" rx="1" fill="#ffd23f"/>
    <path d="M74 42 H80 Q84 42 84 38 V26" fill="none" stroke="#c9ced6" stroke-width="3" stroke-linecap="round"/><circle cx="84" cy="22" r="5" fill="${lin('k', ['#ff7a7a', '#c4121c'])}" stroke="#5e0a10" stroke-width="1"/>
    <path d="M24 10 V86" stroke="#fff" stroke-width="2" opacity=".25"/>`),

  fernseher: () => art('fernseher', BOX, ({ lin }) => `${shadow(50, 90, 36, 3.2)}
    <rect x="6" y="14" width="88" height="60" rx="5" fill="${lin('f', ['#3a3f48', '#0c0d10'])}" stroke="#000" stroke-width="1.4"/>
    <rect x="10" y="18" width="80" height="52" rx="2" fill="${lin('s', ['#4fd1ff', '#1664d0', '#0b2c78'])}"/>
    <path d="M10 62 Q30 44 50 56 T90 48 V70 H10Z" fill="#1f9a49" opacity=".85"/><circle cx="72" cy="32" r="7" fill="#ffd23f"/>
    <path d="M10 18 H56 L28 70 H10Z" fill="#fff" opacity=".16"/>
    <path d="M38 74 H62 L68 84 H32Z" fill="${lin('st', ['#6a717c', '#2c3038'])}"/><rect x="26" y="84" width="48" height="4" rx="2" fill="#23262d"/>
    <circle cx="86" cy="72" r="1.1" fill="#4ecb71"/>`),

  flippertisch: () => art('flippertisch', BOX, ({ lin }) => `${shadow(50, 95, 40, 3)}
    <rect x="22" y="6" width="56" height="30" rx="3" fill="${lin('bg', ['#7a2fd0', '#2a0f6a'])}" stroke="#12063a" stroke-width="1.4"/>
    <text x="50" y="23" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="13" fill="#ffd23f" stroke="#c4121c" stroke-width=".5">PINBALL</text>
    <circle cx="30" cy="30" r="2" fill="#ff6bb5"/><circle cx="70" cy="30" r="2" fill="#3fe0ff"/>
    <path d="M18 38 H82 L96 74 H4Z" fill="${lin('pf', ['#2fb7a4', '#0f5f78'])}" stroke="#0a2a3a" stroke-width="1.6"/>
    <path d="M18 38 L4 74 M82 38 L96 74" stroke="#cfd5dd" stroke-width="3"/>
    ${[[42, 50, '#ff4a4a'], [60, 48, '#ffd23f'], [52, 58, '#3fa7ff']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="5" fill="${c}" stroke="#fff" stroke-width="1.2"/><circle cx="${x}" cy="${y}" r="2" fill="#fff" opacity=".7"/>`).join('')}
    <path d="M30 66 L42 71 L30 71Z M70 66 L58 71 L70 71Z" fill="#ffd23f" stroke="#7a5a00" stroke-width=".6"/>
    <path d="M36 71 L47 74 M64 71 L53 74" stroke="#e8ebef" stroke-width="3.2" stroke-linecap="round"/>
    <circle cx="60" cy="40" r="2.2" fill="#e8ebef" stroke="#7a828d" stroke-width=".6"/>
    <path d="M4 74 H96 V84 H4Z" fill="${lin('fr', ['#c43a3a', '#6a1212'])}"/><rect x="12" y="84" width="7" height="10" fill="#4a4f58"/><rect x="81" y="84" width="7" height="10" fill="#4a4f58"/>`),

  designeranzug: () => art('designeranzug', BOX, ({ lin }) => `${shadow(50, 95, 34, 2.8)}
    <path d="M50 3 q4 0 4 4 q0 4 -4 6" fill="none" stroke="#9aa1ab" stroke-width="2"/><path d="M50 13 L14 28 H86Z" fill="none" stroke="#9aa1ab" stroke-width="1.6"/>
    <path d="M28 20 L40 14 L50 40 L60 14 L72 20 L92 32 L88 92 L12 92 L8 32Z" fill="${lin('j', ['#34457a', '#141a35'])}" stroke="#070a18" stroke-width="1.4"/>
    <path d="M40 14 L60 14 L50 62Z" fill="#fff"/><path d="M40 14 L50 62 L44 60Z" fill="#d6dae2"/>
    <path d="M40 14 L28 20 L34 46 L46 56 L50 40Z" fill="${lin('l1', ['#4b5e9c', '#222b55'], 'h')}" stroke="#070a18" stroke-width="1"/>
    <path d="M60 14 L72 20 L66 46 L54 56 L50 40Z" fill="${lin('l2', ['#4b5e9c', '#222b55'], 'h')}" stroke="#070a18" stroke-width="1"/>
    <path d="M47 24 H53 L55 34 L50 66 L45 34Z" fill="#d9232f" stroke="#7a0d14" stroke-width=".8"/><path d="M46 25 H54 L52 30 H48Z" fill="#a01018"/>
    <rect x="24" y="52" width="12" height="2.4" fill="#fff"/><path d="M22 82 H78" stroke="#0b0f26" stroke-width="1.4"/><circle cx="50" cy="76" r="2" fill="#0b0f26"/><circle cx="50" cy="84" r="2" fill="#0b0f26"/>
    <path d="M14 32 L12 86" stroke="#fff" stroke-width="1.6" opacity=".18"/>`),

  jukebox: () => art('jukebox', BOX, ({ lin }) => `${shadow(50, 95, 32, 3)}
    <path d="M18 92 V36 C18 8 82 8 82 36 V92Z" fill="${lin('b', ['#d9602a', '#7a2210'], 'h')}" stroke="#3a0e04" stroke-width="1.6"/>
    <path d="M25 86 V38 C25 17 75 17 75 38 V86Z" fill="${lin('w', ['#ffe27a', '#ff8a2a', '#c4301c'])}" stroke="#ffd23f" stroke-width="2.4"/>
    ${['#3fa7ff', '#ff6bb5', '#4ecb71', '#b678ff'].map((c, i) => `<path d="M${33 + i * 11} 82 V40" stroke="${c}" stroke-width="4" stroke-linecap="round" opacity=".9"/>`).join('')}
    <circle cx="50" cy="56" r="15" fill="#15161a" stroke="#6a717c" stroke-width="1.2"/><circle cx="50" cy="56" r="5.4" fill="#d9232f"/><circle cx="50" cy="56" r="1.2" fill="#fff"/>
    <path d="M38 50 Q50 44 62 50" fill="none" stroke="#fff" stroke-width="1" opacity=".5"/>
    <path d="M25 38 C25 17 75 17 75 38" fill="none" stroke="#fff" stroke-width="1.6" opacity=".5"/>
    <rect x="24" y="86" width="52" height="6" rx="2" fill="#2a0e06"/>${Array.from({ length: 8 }, (_, i) => `<line x1="${28 + i * 6}" y1="87.5" x2="${28 + i * 6}" y2="90.5" stroke="#8a6a4a" stroke-width="1.2"/>`).join('')}
    <circle cx="50" cy="16" r="3" fill="#ffd23f"/>`),

  silberkette: () => art('silberkette', BOX, ({ lin }) => {
    const links = Array.from({ length: 17 }, (_, i) => { const t = i / 16, x = 12 + 76 * t, y = 14 + 50 * (1 - (2 * t - 1) ** 2), dy = -50 * 2 * (2 * t - 1) * 2 / 76, ang = Math.atan(dy) * 180 / Math.PI;
      return `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="6.2" ry="3.6" transform="rotate(${(ang + (i % 2 ? 90 : 0)).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})" fill="none" stroke="${lin('c', ['#f4f6f9', '#8a929d', '#dfe3e8'])}" stroke-width="2.6"/>`; }).join('');
    return `${shadow(50, 92, 28, 2.5)}${links}<path d="M50 66 V70" stroke="#c9ced6" stroke-width="2"/>
      <path d="M50 70 L62 76 L50 92 L38 76Z" fill="${lin('p', ['#ffffff', '#9aa1ab'])}" stroke="#5f6670" stroke-width="1.2"/><path d="M50 74 L58 77 L50 88 L42 77Z" fill="#3fa7ff" opacity=".85"/><path d="M50 74 L42 77 L50 80Z" fill="#fff" opacity=".6"/>`;
  }),

  goldring: () => art('goldring', BOX, ({ lin }) => `${shadow(50, 92, 30, 3)}
    <ellipse cx="50" cy="64" rx="31" ry="27" fill="none" stroke="#7a5200" stroke-width="13"/>
    <ellipse cx="50" cy="64" rx="31" ry="27" fill="none" stroke="${lin('g', ['#fff2a8', '#f0b21c', '#a86a00'])}" stroke-width="10"/>
    <ellipse cx="50" cy="64" rx="31" ry="27" fill="none" stroke="#fff" stroke-width="1.6" opacity=".5" transform="translate(-2 -2)"/>
    <path d="M40 40 L60 40 L58 28 L42 28Z" fill="${lin('s', ['#ffe27a', '#b87800'])}"/>
    <path d="M36 12 L64 12 L74 24 L50 44 L26 24Z" fill="${lin('d', ['#f4fcff', '#8fd8ff', '#3a8fd0'], 'd')}" stroke="#2a6a9a" stroke-width="1.2"/>
    <path d="M26 24 H74 M36 12 L44 24 L50 44 L56 24 L64 12 M44 24 L50 12 L56 24" fill="none" stroke="#fff" stroke-width="1" opacity=".8"/>
    <path d="M18 10 l3 6 l6 3 l-6 3 l-3 6 l-3 -6 l-6 -3 l6 -3z" fill="#fff"/>`),

  manschettenknoepfe: () => art('manschettenknoepfe', BOX, ({ lin }) => {
    const knop = (x, y, id) => `<rect x="${x - 3}" y="${y + 4}" width="6" height="26" rx="3" fill="${lin('p' + id, ['#e8c15a', '#a37008'], 'h')}" stroke="#6a4600" stroke-width=".8"/>
      <circle cx="${x}" cy="${y}" r="17" fill="${lin('o' + id, ['#fff2a8', '#f0b21c', '#a86a00'], 'd')}" stroke="#6a4600" stroke-width="1.2"/>
      <circle cx="${x}" cy="${y}" r="11.5" fill="${lin('i' + id, ['#6fb3ff', '#1b3f9a', '#0a1a4a'], 'd')}" stroke="#ffe27a" stroke-width="1.6"/>
      <path d="M${x - 7} ${y - 5} Q${x - 2} ${y - 11} ${x + 5} ${y - 8}" fill="none" stroke="#fff" stroke-width="2" opacity=".7" stroke-linecap="round"/>`;
    return `${shadow(50, 94, 34, 3)}${knop(32, 28, 'a')}${knop(68, 58, 'b')}`;
  }),

  whirlpool: () => art('whirlpool', BOX, ({ lin }) => `${shadow(50, 92, 46, 4)}
    <path d="M4 52 V70 A46 24 0 0 0 96 70 V52Z" fill="${lin('w', ['#c4894a', '#7a4a1c'])}" stroke="#4a2c0e" stroke-width="1.2"/>
    ${Array.from({ length: 9 }, (_, i) => `<path d="M${14 + i * 9} 62 V86" stroke="#5a3410" stroke-width="1" opacity=".5"/>`).join('')}
    <ellipse cx="50" cy="52" rx="46" ry="25" fill="#f2f4f7" stroke="#aeb5c0" stroke-width="1.2"/>
    <ellipse cx="50" cy="52" rx="39" ry="20" fill="${lin('wt', ['#8fe6ff', '#2a93d8'])}" stroke="#2a6ea0" stroke-width="1.2"/>
    <ellipse cx="50" cy="52" rx="26" ry="12" fill="none" stroke="#fff" stroke-width="1.2" opacity=".6"/>
    ${[[34, 50], [44, 46], [58, 54], [66, 48], [50, 56], [74, 54], [28, 56]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${2 + (i % 3)}" fill="#fff" opacity=".8"/>`).join('')}
    <path d="M40 34 q-5 -8 0 -14 t0 -12 M54 32 q5 -8 0 -14 t0 -10 M66 34 q-4 -7 0 -12" fill="none" stroke="#fff" stroke-width="2.2" opacity=".6" stroke-linecap="round"/>`),

  rolex: () => art('rolex', BOX, ({ lin }) => {
    const strap = y => `<rect x="36" y="${y}" width="28" height="24" rx="3" fill="${lin('s' + y, ['#f4f6f9', '#8d949f', '#d9dde3'], 'h')}" stroke="#555d68" stroke-width="1"/>${[4, 10, 16].map(d => `<line x1="38" y1="${y + d}" x2="62" y2="${y + d}" stroke="#555d68" stroke-width=".8"/>`).join('')}`;
    return `${shadow(50, 97, 22, 2.2)}${strap(2)}${strap(74)}
      <rect x="76" y="45" width="8" height="10" rx="2" fill="${lin('cr', ['#ffe27a', '#a86a00'])}" stroke="#6a4600" stroke-width=".8"/>
      <circle cx="50" cy="50" r="30" fill="${lin('c', ['#f4f6f9', '#7d8490'])}" stroke="#4a515b" stroke-width="1.4"/>
      <circle cx="50" cy="50" r="26" fill="none" stroke="#0c6a3a" stroke-width="7"/><circle cx="50" cy="50" r="26" fill="none" stroke="#ffe27a" stroke-width="1" stroke-dasharray="2 2.6" opacity=".9"/>
      <circle cx="50" cy="50" r="20" fill="${lin('d', ['#1f2630', '#06080c'], 'd')}" stroke="#cfd5dd" stroke-width="1.4"/>
      ${Array.from({ length: 12 }, (_, i) => `<rect x="49.2" y="31.5" width="1.6" height="${i % 3 ? 3 : 5}" fill="#fff" transform="rotate(${i * 30} 50 50)"/>`).join('')}
      <path d="M50 50 L50 36" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><path d="M50 50 L61 56" stroke="#fff" stroke-width="2" stroke-linecap="round"/><path d="M50 50 L40 63" stroke="#ffe27a" stroke-width="1" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="2.4" fill="#ffe27a"/><path d="M34 34 Q50 26 66 34" fill="none" stroke="#fff" stroke-width="2" opacity=".35" stroke-linecap="round"/>`;
  }),

  heimkino: () => art('heimkino', BOX, ({ lin }) => `${shadow(50, 95, 44, 2.8)}
    <rect x="16" y="10" width="68" height="42" rx="2" fill="${lin('s', ['#7fd0ff', '#2a5fc0', '#14286a'])}" stroke="#e8ebef" stroke-width="2.6"/>
    <path d="M16 46 L34 28 L46 40 L58 24 L84 48 V52 H16Z" fill="#0f2f5a" opacity=".7"/><circle cx="68" cy="22" r="6" fill="#fff3a0"/>
    <path d="M16 10 H56 L30 52 H16Z" fill="#fff" opacity=".14"/>
    <path d="M6 4 H24 Q18 24 20 56 H6Z" fill="${lin('cl', ['#d9232f', '#7a0d14'], 'h')}"/><path d="M94 4 H76 Q82 24 80 56 H94Z" fill="${lin('cr', ['#7a0d14', '#d9232f'], 'h')}"/>
    <path d="M6 4 H94" stroke="#ffd23f" stroke-width="3"/>
    ${[12, 38, 64].map((x, i) => `<rect x="${x}" y="64" width="24" height="24" rx="8" fill="${lin('sa' + i, ['#e0364a', '#7a0d1c'])}" stroke="#4a0610" stroke-width="1.2"/><rect x="${x - 3}" y="74" width="5" height="14" rx="2" fill="#8a1020"/><rect x="${x + 22}" y="74" width="5" height="14" rx="2" fill="#8a1020"/>`).join('')}`),

  actioncomics1: () => art('actioncomics1', BOX, ({ lin, rad }) => `${shadow(52, 96, 34, 2.4)}
    <rect x="22" y="4" width="58" height="90" rx="2" fill="${lin('c', ['#3fa0ff', '#1a4fc0'])}" stroke="#0a1c5a" stroke-width="1.6"/>
    <rect x="22" y="4" width="58" height="16" fill="#ffd23f" stroke="#0a1c5a" stroke-width="1.2"/>
    <text x="51" y="15.5" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="9" fill="#d9232f" stroke="#7a0d14" stroke-width=".3" textLength="48" lengthAdjust="spacingAndGlyphs">ACTION COMICS</text>
    <circle cx="51" cy="52" r="30" fill="${rad('b', ['#fff3a0', '#ffb62a', 'rgba(255,182,42,0)'])}"/>
    <path d="M33 78 L48 40 L70 78Z" fill="#d9232f"/><path d="M42 80 V54 H60 V80Z" fill="#2a5fd0" stroke="#0a1c5a" stroke-width="1"/>
    <circle cx="51" cy="44" r="7" fill="${lin('f', SKIN)}" stroke="#7a4a1c" stroke-width=".8"/><path d="M44 42 Q51 34 58 42 Q54 38 44 42Z" fill="#14161a"/>
    <path d="M43 56 L32 40 M59 56 L70 40" stroke="#2a5fd0" stroke-width="5" stroke-linecap="round"/><rect x="29" y="28" width="42" height="12" rx="2" fill="#2fa14a" stroke="#0e4a1c" stroke-width="1"/>
    <circle cx="36" cy="42" r="2.6" fill="${SKIN[0]}"/><circle cx="66" cy="42" r="2.6" fill="${SKIN[0]}"/>
    <path d="M47 62 l4 -4 l4 4 l-4 5z" fill="#ffd23f"/><text x="51" y="90" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="8" fill="#fff">No. 1</text>
    <circle cx="28" cy="26" r="0" /><circle cx="72" cy="14" r="0"/>`),

  monalisa: () => art('monalisa', BOX, ({ lin }) => `${shadow(50, 97, 32, 2.2)}
    <rect x="16" y="4" width="68" height="90" rx="3" fill="${lin('fr', ['#ffe27a', '#b87800', '#f5c542'], 'd')}" stroke="#5a3a00" stroke-width="1.6"/>
    <rect x="23" y="11" width="54" height="76" fill="#4a3b1c" stroke="#5a3a00" stroke-width="1.4"/>
    <rect x="25" y="13" width="50" height="72" fill="${lin('bg', ['#8fa870', '#b8a45c', '#6a5a2a'])}"/>
    <path d="M25 44 Q38 36 50 46 T75 40 V58 H25Z" fill="#6f8a8f" opacity=".8"/><path d="M25 50 Q40 44 52 52 T75 48 V60 H25Z" fill="#5a7a48" opacity=".8"/>
    <path d="M32 85 L34 60 Q38 52 50 52 Q62 52 66 60 L68 85Z" fill="#3a2a14"/><path d="M42 54 L50 66 L58 54 Q50 50 42 54Z" fill="#b8924a"/>
    <path d="M36 48 Q34 28 50 26 Q66 28 64 48 L60 56 L40 56Z" fill="#241608"/>
    <ellipse cx="50" cy="40" rx="9" ry="11" fill="${lin('fc', ['#f0cf9a', '#b88a52'])}"/>
    <path d="M45 38 q2 -1.4 4 0 M52 38 q2 -1.4 4 0" stroke="#3a2a14" stroke-width="1" fill="none"/><path d="M46 46 Q50 48 54 46" stroke="#8a4a2a" stroke-width="1" fill="none"/>
    <ellipse cx="46" cy="76" rx="9" ry="5" fill="#d4a870"/><ellipse cx="55" cy="77" rx="8" ry="4.5" fill="#c49860"/>`),

  heiligergral: () => art('heiligergral', BOX, ({ lin, rad }) => `<circle cx="50" cy="44" r="42" fill="${rad('g', ['#fff7b8', 'rgba(255,230,120,.5)', 'rgba(255,230,120,0)'])}"/>
    ${Array.from({ length: 12 }, (_, i) => `<line x1="50" y1="44" x2="50" y2="4" stroke="#fff3a0" stroke-width="1.6" opacity=".6" transform="rotate(${i * 30} 50 44)"/>`).join('')}
    ${shadow(50, 93, 26, 3)}
    <path d="M26 20 H74 C74 46 64 58 50 60 C36 58 26 46 26 20Z" fill="${lin('c', ['#fff2a8', '#f0b21c', '#a86a00'], 'h')}" stroke="#6a4600" stroke-width="1.6"/>
    <path d="M26 20 H74" stroke="#6a4600" stroke-width="3"/><ellipse cx="50" cy="20" rx="24" ry="4" fill="#8a5a00"/>
    <path d="M32 24 Q34 42 44 52" fill="none" stroke="#fff" stroke-width="2.4" opacity=".6" stroke-linecap="round"/>
    <circle cx="50" cy="34" r="4.2" fill="#d9232f" stroke="#fff" stroke-width="1"/><circle cx="38" cy="30" r="2.8" fill="#3fa7ff" stroke="#fff" stroke-width=".8"/><circle cx="62" cy="30" r="2.8" fill="#4ecb71" stroke="#fff" stroke-width=".8"/>
    <rect x="45" y="60" width="10" height="18" rx="3" fill="${lin('s', ['#f0b21c', '#a86a00'], 'h')}" stroke="#6a4600" stroke-width="1"/><circle cx="50" cy="69" r="3.6" fill="#d9232f" stroke="#ffe27a" stroke-width="1"/>
    <path d="M30 88 Q30 78 50 78 Q70 78 70 88Z" fill="${lin('b', ['#fff2a8', '#f0b21c', '#a86a00'])}" stroke="#6a4600" stroke-width="1.4"/>`),

  excalibur: () => art('excalibur', BOX, ({ lin, rad }) => `<ellipse cx="50" cy="46" rx="26" ry="38" fill="${rad('g', ['rgba(140,220,255,.7)', 'rgba(140,220,255,0)'])}"/>
    <path d="M10 92 C6 72 18 60 36 62 L64 62 C84 60 94 72 90 92Z" fill="${lin('r', ['#a6adb8', '#5a616c'])}" stroke="#2c3038" stroke-width="1.4"/>
    <path d="M22 70 L30 78 L26 90 M70 66 L64 76 L72 90 M48 66 L52 74" fill="none" stroke="#3a3f48" stroke-width="1.2"/>
    <path d="M8 82 Q16 76 22 82 Q14 86 8 82Z M70 64 Q78 60 84 66 Q76 68 70 64Z" fill="#4a9a3c"/>
    <path d="M45 34 H55 V62 L50 70 L45 62Z" fill="${lin('b', ['#ffffff', '#9ec8e8', '#e8f4ff'], 'h')}" stroke="#3a5a78" stroke-width="1.2"/><path d="M50 36 V64" stroke="#6a8aa8" stroke-width="1.2"/>
    <rect x="28" y="30" width="44" height="7" rx="3.4" fill="${lin('cg', ['#ffe27a', '#f0b21c', '#a86a00'])}" stroke="#6a4600" stroke-width="1.2"/>
    <rect x="46.5" y="12" width="7" height="19" rx="2" fill="#5a3410" stroke="#2a1606" stroke-width="1"/><path d="M46.5 16 H53.5 M46.5 20 H53.5 M46.5 24 H53.5" stroke="#c4894a" stroke-width="1"/>
    <circle cx="50" cy="9" r="5" fill="${lin('pm', ['#fff2a8', '#d99a10'])}" stroke="#6a4600" stroke-width="1.2"/><circle cx="50" cy="9" r="1.8" fill="#3fa7ff"/>`),

  buechsederpandora: () => art('buechsederpandora', BOX, ({ lin, rad }) => `<ellipse cx="50" cy="38" rx="34" ry="30" fill="${rad('g', ['rgba(190,110,255,.8)', 'rgba(190,110,255,0)'])}"/>
    <path d="M36 44 q-10 -10 0 -18 t0 -16 M52 42 q10 -10 0 -20 t2 -16 M66 44 q-8 -8 0 -16" fill="none" stroke="#e8c6ff" stroke-width="3" stroke-linecap="round" opacity=".75"/>
    ${[[24, 22], [78, 18], [70, 36], [30, 40]].map(([x, y]) => `<path d="M${x} ${y - 5} l1.6 3.4 l3.4 1.6 l-3.4 1.6 l-1.6 3.4 l-1.6 -3.4 l-3.4 -1.6 l3.4 -1.6z" fill="#fff"/>`).join('')}
    ${shadow(50, 94, 38, 3.2)}
    <path d="M14 56 L90 56 V88 Q90 92 86 92 H18 Q14 92 14 88Z" fill="${lin('b', ['#8a4ad0', '#3a1478'])}" stroke="#1e0a46" stroke-width="1.6"/>
    <path d="M14 56 L24 44 L98 44 L90 56Z" fill="#2a0e5a" stroke="#1e0a46" stroke-width="1.2"/>
    <path d="M10 52 L84 52 L90 40 L18 34Z" fill="${lin('l', ['#b06af0', '#5a22a8'])}" stroke="#1e0a46" stroke-width="1.6"/>
    <path d="M14 66 H90 M14 80 H90" stroke="#ffd23f" stroke-width="2.4"/><path d="M30 56 V92 M72 56 V92" stroke="#ffd23f" stroke-width="2.4"/>
    <rect x="44" y="62" width="14" height="14" rx="3" fill="${lin('lk', ['#ffe27a', '#b87800'])}" stroke="#6a4600" stroke-width="1"/><circle cx="51" cy="68" r="2" fill="#3a1478"/><rect x="50" y="68" width="2" height="5" fill="#3a1478"/>
    <circle cx="20" cy="62" r="2" fill="#ffd23f"/><circle cx="84" cy="62" r="2" fill="#ffd23f"/><circle cx="20" cy="86" r="2" fill="#ffd23f"/><circle cx="84" cy="86" r="2" fill="#ffd23f"/>`),
};
