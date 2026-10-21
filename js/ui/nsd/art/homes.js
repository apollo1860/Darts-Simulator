// Immobilien als eigene Illustrationen (Szenen, 160 × 100)
import { art, WIDE, sky, ground, hills, tree, pine, palm, win, cloud } from './core.js';

const door = (x, y, w, h, c = '#7a4a22') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}" stroke="#3a2008" stroke-width=".8"/><circle cx="${x + w - 2.2}" cy="${y + h * 0.55}" r=".9" fill="#ffd23f"/>`;
const shutter = (x, y, w, h, c = '#2f6a9a') => `<rect x="${x - 2.4}" y="${y}" width="2.2" height="${h}" fill="${c}"/><rect x="${x + w + 0.2}" y="${y}" width="2.2" height="${h}" fill="${c}"/>`;
const bush = (x, y, r = 5, c = '#2f8a32') => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.75}" fill="${c}"/><ellipse cx="${x - r * 0.3}" cy="${y - r * 0.25}" rx="${r * 0.5}" ry="${r * 0.35}" fill="#fff" opacity=".12"/>`;
const flowers = (x, y, n = 5) => Array.from({ length: n }, (_, i) => `<circle cx="${x + i * 3.4}" cy="${y + (i % 2) * 1.4}" r="1" fill="${['#ff5a7a', '#ffd23f', '#fff', '#ff9a3a', '#c06aff'][i % 5]}"/>`).join('');
const brickWall = (x, y, w, h) => Array.from({ length: Math.floor(h / 3) }, (_, i) => `<path d="M${x} ${y + i * 3}H${x + w}" stroke="#000" stroke-width=".3" opacity=".25"/>`).join('');
const logLines = (x, y, w, h) => Array.from({ length: Math.floor(h / 3.4) }, (_, i) => `<path d="M${x} ${y + i * 3.4}H${x + w}" stroke="#4a2808" stroke-width=".7" opacity=".6"/><path d="M${x} ${y + i * 3.4 + 1.2}H${x + w}" stroke="#d99a5a" stroke-width=".5" opacity=".35"/>`).join('');

export const HOME_ART = {
  hundehuette: () => art('hundehuette', WIDE, ({ lin }) => `${sky(lin)}${hills(70)}${ground(lin, 76)}${tree(22, 76, 1.2)}${tree(140, 76, 1)}
    <ellipse cx="80" cy="88" rx="34" ry="4" fill="#000" opacity=".2"/>
    <rect x="56" y="52" width="48" height="34" fill="${lin('w', ['#d99a5a', '#8a5224'])}" stroke="#3a2008" stroke-width="1.2"/>${logLines(56, 54, 48, 32).replace(/stroke="#4a2808"/g, 'stroke="#5a3010"')}
    <path d="M48 56 L80 28 L112 56Z" fill="${lin('r', ['#e0503a', '#8a1f12'])}" stroke="#3a0e04" stroke-width="1.4"/><path d="M80 28 L112 56 L104 56 L80 34Z" fill="#000" opacity=".15"/>
    <path d="M52 52 H108" stroke="#3a0e04" stroke-width="1.4"/>
    <path d="M70 86 V70 A10 10 0 0 1 90 70 V86Z" fill="#241408" stroke="#3a2008" stroke-width="1.2"/>
    <circle cx="80" cy="78" r="7.4" fill="#d9a46a" stroke="#7a4a22" stroke-width=".8"/><ellipse cx="72.6" cy="73" rx="3" ry="5.4" fill="#6a3a14" transform="rotate(14 72.6 73)"/><ellipse cx="87.4" cy="73" rx="3" ry="5.4" fill="#6a3a14" transform="rotate(-14 87.4 73)"/>
    <circle cx="77.4" cy="77" r="1.2" fill="#14161a"/><circle cx="82.6" cy="77" r="1.2" fill="#14161a"/><ellipse cx="80" cy="81" rx="2.4" ry="1.7" fill="#14161a"/><path d="M80 82 q-3 3 -5 1" stroke="#ff7a8a" stroke-width="1.2" fill="none"/>
    <rect x="70" y="42" width="20" height="6" rx="1" fill="#fff" stroke="#3a2008" stroke-width=".6"/><text x="80" y="47" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="5.4" fill="#8a1f12">REX</text>
    <ellipse cx="120" cy="86" rx="7" ry="2.4" fill="#d9232f" stroke="#7a0d14" stroke-width=".6"/><path d="M114 83 q6 -5 12 0" fill="#ffd23f" opacity=".9"/>
    <path d="M32 84 l8 -2 l1 2 l-8 2z" fill="#f4f0e0" stroke="#8a7a50" stroke-width=".6"/>${flowers(36, 90, 6)}`),

  wgzimmer: () => art('wgzimmer', WIDE, ({ lin }) => `<rect width="160" height="100" fill="${lin('wall', ['#f0d9a8', '#d9b878'])}"/>
    <rect y="72" width="160" height="28" fill="${lin('fl', ['#b8803e', '#7a4a1c'])}"/>${Array.from({ length: 10 }, (_, i) => `<path d="M${i * 18 - 4} 72 L${i * 22 - 20} 100" stroke="#5a3410" stroke-width=".6" opacity=".6"/>`).join('')}
    <path d="M0 72 H160" stroke="#8a5a24" stroke-width="2"/>
    <rect x="98" y="14" width="46" height="38" fill="#fff" stroke="#fff" stroke-width="2"/><rect x="100" y="16" width="42" height="34" fill="${lin('wd', ['#ffb870', '#6a4aa8', '#1c2a6a'])}"/>
    <path d="M100 50 V34 h5 v-6 h5 v10 h4 v-14 h6 v18 h5 v-8 h6 v14 h6 v-10 h5 V50Z" fill="#14183a" opacity=".85"/>${[104, 112, 120, 128, 136].map(x => `<rect x="${x}" y="${38 + (x % 3) * 2}" width="1.6" height="1.6" fill="#ffe27a"/>`).join('')}
    <path d="M121 16 V50 M100 33 H142" stroke="#fff" stroke-width="1.6"/><path d="M94 12 H148 V54 H94Z" fill="none" stroke="#e8d8b0" stroke-width="1"/>
    <path d="M92 10 Q96 26 94 42 M150 10 Q146 26 148 42" stroke="#d9232f" stroke-width="5" fill="none" opacity=".85"/>
    <rect x="10" y="48" width="20" height="26" fill="#fff" stroke="#8a5a24" stroke-width="1.2"/><rect x="12" y="50" width="16" height="22" fill="${lin('po', ['#ff6bb5', '#3fa7ff'])}"/><circle cx="20" cy="58" r="4" fill="#ffd23f"/><path d="M12 72 L18 64 L22 68 L28 60 V72Z" fill="#1c3f94"/>
    <rect x="8" y="64" width="62" height="22" rx="3" fill="${lin('bd', ['#8a5a24', '#4a2c0e'])}"/><rect x="10" y="56" width="58" height="14" rx="5" fill="${lin('mt', ['#ffffff', '#c4ccd6'])}" stroke="#8a929c" stroke-width=".8"/>
    <rect x="34" y="56" width="34" height="14" rx="4" fill="${lin('bl', ['#4ab0ff', '#1450b8'])}"/><path d="M38 58 V69 M46 58 V69 M54 58 V69 M62 58 V69" stroke="#fff" stroke-width="1" opacity=".3"/>
    <rect x="12" y="52" width="20" height="9" rx="4" fill="#fff" stroke="#8a929c" stroke-width=".8"/>
    <rect x="86" y="62" width="40" height="5" fill="${lin('dk', ['#c4894a', '#7a4a1c'])}"/><rect x="88" y="67" width="3" height="20" fill="#6a3a14"/><rect x="121" y="67" width="3" height="20" fill="#6a3a14"/>
    <rect x="94" y="52" width="14" height="10" rx="1" fill="#2a2f36"/><rect x="95.5" y="53.5" width="11" height="7" fill="${lin('sc', ['#6fb3ff', '#1b3f8a'])}"/><rect x="99" y="62" width="4" height="2" fill="#2a2f36"/>
    <path d="M114 62 L118 50 L126 46" stroke="#2a2f36" stroke-width="1.6" fill="none"/><path d="M122 46 H132 L128 52Z" fill="#ffd23f"/>
    <rect x="132" y="68" width="12" height="16" rx="1" fill="#c4521c"/><path d="M138 68 C130 56 134 48 138 54 C142 46 146 58 138 68Z" fill="#2f8a32"/>
    <path d="M0 6 Q20 14 40 6 T80 6 T120 6 T160 6" fill="none" stroke="#ffe27a" stroke-width="1"/>${Array.from({ length: 8 }, (_, i) => `<circle cx="${i * 20 + 8}" cy="${i % 2 ? 11 : 9}" r="1.8" fill="${['#ff6b6b', '#ffd23f', '#4ecb71', '#3fa7ff'][i % 4]}"/>`).join('')}`),

  apartment: () => art('apartment', WIDE, ({ lin }) => `${sky(lin)}${ground(lin, 88, '#7a8a6a', '#4a5a40')}
    <path d="M0 88 H160" stroke="#cfd5dd" stroke-width="3"/>
    <path d="M58 94 H110" stroke="#3a3f48" stroke-width="2" opacity="0"/>
    <path d="M56 12 L98 6 V92 H56Z" fill="${lin('f', ['#d9603a', '#8a2c14'])}" stroke="#4a1004" stroke-width="1.2"/>
    <path d="M98 6 L112 12 V92 H98Z" fill="${lin('s', ['#eed9b0', '#b8a070'])}" stroke="#4a1004" stroke-width="1"/>
    ${Array.from({ length: 11 }, (_, r) => Array.from({ length: 5 }, (_, c) => `<rect x="${59 + c * 7.6}" y="${17 + r * 6.8}" width="5" height="4.2" fill="${(r * 5 + c) % 7 === 0 ? '#ffe27a' : lin('g' + r + c, ['#bfe6ff', '#4a7aa8'])}" stroke="#4a1004" stroke-width=".4"/>`).join('')).join('')}
    ${Array.from({ length: 11 }, (_, r) => Array.from({ length: 2 }, (_, c) => `<rect x="${101 + c * 5.4}" y="${14 + r * 6.8}" width="3.6" height="4.2" fill="#8aa8c0" opacity=".8"/>`).join('')).join('')}
    <rect x="72" y="82" width="14" height="10" fill="#3a2008"/><rect x="73" y="83" width="5.4" height="9" fill="#a8d8f8"/><rect x="79.6" y="83" width="5.4" height="9" fill="#a8d8f8"/><path d="M70 82 H88" stroke="#d9232f" stroke-width="2"/>
    <path d="M56 12 L98 6" stroke="#5a1808" stroke-width="2.4"/><rect x="74" y="1" width="12" height="5" fill="#8a929c"/>
    ${tree(34, 92, 1.2)}${tree(130, 92, 1.4)}${bush(46, 91, 5)}${bush(120, 91, 5)}
    <rect x="18" y="80" width="14" height="9" rx="2" fill="#3fa7ff"/><rect x="20" y="82" width="10" height="3" fill="#bfe6ff"/><circle cx="21" cy="90" r="2" fill="#222"/><circle cx="29" cy="90" r="2" fill="#222"/>`),

  bungalow: () => art('bungalow', WIDE, ({ lin }) => `${sky(lin)}${hills(66)}${tree(14, 80, 1.3)}${tree(150, 78, 1.1)}${ground(lin, 78)}
    <rect x="30" y="80" width="100" height="5" fill="#2f6a1f" opacity=".5"/><path d="M30 84 Q80 76 130 84" fill="#4f9a3c"/>
    <rect x="32" y="52" width="96" height="30" fill="${lin('w', ['#ffffff', '#d4d8de'])}" stroke="#8a929c" stroke-width="1"/>
    <path d="M20 54 L44 32 H116 L140 54Z" fill="${lin('r', ['#b8693a', '#6a3414'])}" stroke="#3a1c08" stroke-width="1.4"/><path d="M44 32 L40 54 M116 32 L120 54 M80 32 V54" stroke="#3a1c08" stroke-width=".7" opacity=".6"/>
    <path d="M20 54 H140" stroke="#3a1c08" stroke-width="2"/><rect x="104" y="24" width="8" height="12" fill="#a0583a" stroke="#3a1c08" stroke-width=".8"/>
    ${win(42, 60, 16, 12)}${shutter(42, 60, 16, 12)}${win(68, 60, 16, 12)}${shutter(68, 60, 16, 12)}${win(106, 60, 16, 12)}${shutter(106, 60, 16, 12)}
    ${door(90, 62, 11, 20, '#5a3a20')}<path d="M88 62 H103 V60 H88Z" fill="#8a5a2a"/>
    <path d="M30 86 H130" stroke="#3f8f2c" stroke-width="6"/><path d="M88 82 Q86 90 70 96" stroke="#d8d0c0" stroke-width="5" fill="none"/>
    ${bush(40, 82, 6)}${bush(52, 83, 5)}${bush(118, 83, 6)}${flowers(60, 86, 5)}`),

  haus: () => art('haus', WIDE, ({ lin }) => `${sky(lin)}${hills(66)}${tree(14, 80, 1.3)}${tree(148, 80, 1.2, '#3a9a3a')}${ground(lin, 80)}
    <rect x="40" y="48" width="80" height="34" fill="${lin('w', ['#f7e8b0', '#d9c27a'])}" stroke="#8a7a3a" stroke-width="1"/>
    <path d="M34 50 L80 18 L126 50Z" fill="${lin('r', ['#c4382c', '#7a1810'])}" stroke="#3a0a06" stroke-width="1.4"/>
    <path d="M60 52 L72 38 H100 L112 52Z" fill="#e8d9a0" stroke="#8a7a3a" stroke-width=".8" opacity="0"/>
    <path d="M62 38 L80 22 L98 38Z" fill="${lin('g', ['#f7e8b0', '#d9c27a'])}" stroke="#8a7a3a" stroke-width="1"/><path d="M58 38 L80 16 L102 38" fill="none" stroke="#7a1810" stroke-width="3"/>
    ${win(74, 28, 12, 12, '#a8d8f8')}<rect x="102" y="26" width="8" height="14" fill="#a0583a" stroke="#3a1c08" stroke-width=".8"/>
    ${win(46, 54, 14, 14)}${shutter(46, 54, 14, 14, '#b82c2c')}${win(100, 54, 14, 14)}${shutter(100, 54, 14, 14, '#b82c2c')}
    <rect x="66" y="56" width="28" height="26" fill="${lin('d', ['#a0583a', '#6a3414'])}" opacity="0"/>
    ${door(74, 62, 12, 20, '#7a1810')}${win(66, 56, 6, 10, '#a8d8f8')}
    <rect x="62" y="50" width="36" height="3" fill="#fff" stroke="#8a929c" stroke-width=".5"/><path d="M62 53 V82 M98 53 V82 M70 53 V82 M90 53 V82" stroke="#fff" stroke-width="2"/><path d="M60 58 H100" stroke="#fff" stroke-width="1.6"/>
    <rect x="56" y="80" width="48" height="4" fill="#d8d0c0"/><path d="M52 84 H108" stroke="#b8b0a0" stroke-width="1.4"/>
    <g stroke="#fff" stroke-width="1.6">${Array.from({ length: 14 }, (_, i) => `<path d="M${14 + i * 4.4} 78 V88"/>`).join('')}<path d="M14 80 H72 M14 85 H72"/></g>
    ${bush(46, 83, 5)}${bush(116, 83, 6)}${flowers(100, 87, 6)}`),

  blockhuette: () => art('blockhuette', WIDE, ({ lin }) => `${sky(lin, '#6ab4ee', '#dff3ff')}
    <path d="M0 56 L22 30 L40 50 L62 22 L88 52 L108 34 L130 54 L160 30 V70 H0Z" fill="#8fa8c4"/><path d="M62 22 L54 34 L62 32 L68 36Z M22 30 L16 38 L24 36Z M160 30 L150 42 L160 40Z" fill="#fff"/>
    ${[6, 24, 46, 118, 138, 152].map((x, i) => pine(x, 74 + (i % 2) * 3, 1.5 - (i % 3) * 0.1)).join('')}${ground(lin, 78, '#5aa83c', '#2f6a1f')}
    <rect x="40" y="48" width="78" height="34" fill="${lin('lg', ['#c4894a', '#8a5224'])}" stroke="#3a2008" stroke-width="1.2"/>${logLines(40, 49, 78, 33)}
    ${Array.from({ length: 10 }, (_, i) => `<circle cx="${41 + 0}" cy="${50 + i * 3.4}" r="1.5" fill="#e8b878" stroke="#4a2808" stroke-width=".4"/><circle cx="${117}" cy="${50 + i * 3.4}" r="1.5" fill="#e8b878" stroke="#4a2808" stroke-width=".4"/>`).join('')}
    <path d="M34 50 L80 24 L132 50Z" fill="${lin('r', ['#7ec4c8', '#3a7a88'])}" stroke="#1a3a44" stroke-width="1.4"/><path d="M80 24 L132 50 L120 50 L80 30Z" fill="#000" opacity=".12"/>
    <rect x="98" y="16" width="8" height="18" fill="#7a5a4a" stroke="#2a1608" stroke-width=".8"/><path d="M102 14 q-4 -5 0 -9 t0 -8" fill="none" stroke="#fff" stroke-width="3" opacity=".7" stroke-linecap="round"/>
    ${win(48, 56, 14, 14, '#ffe27a', '#4a2808')}${door(68, 58, 12, 24, '#5a3a20')}
    <rect x="86" y="60" width="26" height="22" fill="#2a2418" opacity=".5"/><path d="M84 52 H130 V82 H84Z" fill="none" stroke="#6a3a14" stroke-width="0"/>
    <path d="M84 58 H124 V82 H84Z" fill="#ffe27a" opacity=".0"/>
    <rect x="84" y="54" width="48" height="4" fill="#6a3a14"/><path d="M86 58 V82 M122 58 V82 M130 58 V82" stroke="#8a5224" stroke-width="3"/>
    <path d="M84 70 H130" stroke="#8a5224" stroke-width="2"/><path d="M92 70 V82 M100 70 V82 M108 70 V82 M116 70 V82" stroke="#8a5224" stroke-width="1.2"/>
    <path d="M84 82 H132 L136 86 H80Z" fill="#a0683a"/><path d="M92 86 L88 90 M120 86 L124 90" stroke="#6a3a14" stroke-width="1.4"/>
    <g fill="#5a3a20"><rect x="44" y="82" width="22" height="4" rx="1"/><rect x="48" y="78" width="3" height="4"/></g><ellipse cx="28" cy="84" rx="6" ry="3.4" fill="#6a3a14"/><ellipse cx="28" cy="82" rx="5" ry="1.8" fill="#e8b878"/>`),

  stadthaus: () => art('stadthaus', WIDE, ({ lin }) => `${sky(lin)}
    <rect y="84" width="160" height="16" fill="${lin('st', ['#8a929c', '#5a626c'])}"/><path d="M0 92 H160" stroke="#fff" stroke-width="1.4" stroke-dasharray="8 6" opacity=".7"/><rect y="80" width="160" height="5" fill="#cfd5dd"/>
    ${[[8, '#5a7ab8', '#2a3a6a'], [58, '#f0e8d8', '#8a5a2a'], [108, '#c8a0a0', '#6a2a2a']].map(([x, c, r], i) => `
      <rect x="${x}" y="30" width="46" height="52" fill="${c}" stroke="#3a3f48" stroke-width="1"/>
      <path d="M${x - 3} 32 L${x + 23} ${12 + i * 3} L${x + 49} 32Z" fill="${r}" stroke="#14161a" stroke-width="1.2"/>
      ${win(x + 6, 38, 11, 14)}${win(x + 29, 38, 11, 14)}${win(x + 6, 58, 11, 14)}${win(x + 29, 58, 11, 14)}
      <path d="M${x + 4} 37 H${x + 19} M${x + 27} 37 H${x + 42}" stroke="#14161a" stroke-width="1.6"/>
      ${door(x + 18, 62, 10, 20, ['#2a3a6a', '#7a2a2a', '#2a5a3a'][i])}<path d="M${x + 14} 82 H${x + 32} V84 H${x + 14}Z M${x + 16} 84 H${x + 30} V86 H${x + 16}Z" fill="#cfd5dd"/>
      <rect x="${x + 36}" y="${i === 1 ? 22 : 18}" width="5" height="12" fill="#8a4a3a" stroke="#3a1c08" stroke-width=".6"/>`).join('')}
    <rect x="94" y="62" width="12" height="18" fill="none"/>${tree(50, 84, 1.1, '#3a9a3a')}${tree(102, 84, 1.1, '#3a9a3a')}
    <circle cx="80" cy="26" r="0"/>`),

  landhaus: () => art('landhaus', WIDE, ({ lin }) => `${sky(lin, '#5aa9ec', '#e6f4ff')}${hills(64, '#5aa43c', '#3b7e2e')}${tree(12, 80, 1.6, '#2a7a2c')}${tree(30, 82, 1.2)}${tree(150, 80, 1.7, '#2a7a2c')}${ground(lin, 80)}
    <rect x="34" y="46" width="92" height="36" fill="${lin('w', ['#d8b88a', '#a07a4a'])}" stroke="#4a2c14" stroke-width="1"/>${brickWall(34, 46, 92, 36)}
    <path d="M28 50 L60 24 H100 L132 50Z" fill="${lin('r', ['#8a6a4a', '#4a3018'])}" stroke="#2a1608" stroke-width="1.4"/><path d="M60 24 L56 50 M100 24 L104 50" stroke="#2a1608" stroke-width=".8" opacity=".6"/>
    <path d="M52 44 L66 30 H94 L108 44Z" fill="${lin('g', ['#a07a4a', '#6a4a28'])}" stroke="#2a1608" stroke-width="1"/>
    <rect x="42" y="14" width="9" height="30" fill="${lin('ch', ['#b87a4a', '#7a4a28'], 'h')}" stroke="#2a1608" stroke-width="1"/><rect x="40" y="12" width="13" height="4" fill="#5a3a20"/>
    ${win(70, 33, 8, 9, '#a8d8f8', '#f4ecd8')}${win(82, 33, 8, 9, '#a8d8f8', '#f4ecd8')}
    ${win(40, 54, 12, 16, '#a8d8f8', '#f4ecd8')}${win(58, 54, 12, 16, '#a8d8f8', '#f4ecd8')}${win(90, 54, 12, 16, '#a8d8f8', '#f4ecd8')}${win(108, 54, 12, 16, '#a8d8f8', '#f4ecd8')}
    <path d="M74 82 V64 A8 8 0 0 1 90 64 V82Z" fill="#4a2c14" stroke="#f4ecd8" stroke-width="1.6"/><path d="M70 82 H94 V85 H70Z" fill="#cfc8b8"/>
    <path d="M36 52 Q38 60 36 70 M44 60 Q42 70 46 78 M118 52 Q120 62 116 74" stroke="#3a8a3a" stroke-width="2" fill="none"/><circle cx="37" cy="60" r="1.4" fill="#2f8a32"/><circle cx="117" cy="62" r="1.4" fill="#2f8a32"/>
    <path d="M80 86 Q70 92 50 98 H100 Q90 92 84 86Z" fill="#d8d0c0"/>${bush(34, 84, 6)}${bush(124, 84, 6)}${bush(52, 85, 4, '#4f9a3c')}${flowers(100, 88, 6)}`),

  strandhaus: () => art('strandhaus', WIDE, ({ lin }) => `${sky(lin, '#4aa0e8', '#ffe8c0')}<circle cx="132" cy="22" r="9" fill="#fff3a0" opacity=".9"/>
    <rect y="54" width="160" height="26" fill="${lin('sea', ['#6fd0f0', '#1c8ac8'])}"/><path d="M0 60 q10 -3 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 M0 68 q10 -3 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#fff" stroke-width="1" opacity=".5"/>
    <path d="M0 78 Q60 70 160 80 V100 H0Z" fill="${lin('sd', ['#f4e0a8', '#d8b878'])}"/>
    ${Array.from({ length: 6 }, (_, i) => `<rect x="${34 + i * 15}" y="62" width="3" height="22" fill="#6a4a2a"/>`).join('')}
    <rect x="28" y="60" width="98" height="5" fill="${lin('dk', ['#c4894a', '#7a4a1c'])}"/>
    <rect x="38" y="36" width="64" height="25" fill="${lin('w', ['#ffffff', '#cfe6f4'])}" stroke="#6a8aa8" stroke-width="1"/><path d="M32 38 L70 18 L108 38Z" fill="${lin('r', ['#2a8ae0', '#14509a'])}" stroke="#0a2a5a" stroke-width="1.4"/>
    ${win(44, 42, 14, 12, '#7ad0ff', '#fff')}${win(80, 42, 14, 12, '#7ad0ff', '#fff')}${door(62, 42, 11, 19, '#e0503a')}
    <path d="M104 60 V44 H126 V60" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M104 52 H126" stroke="#fff" stroke-width="1"/>
    <rect x="108" y="42" width="16" height="3" fill="#ffd23f"/><path d="M108 45 L106 52 H126 L124 45Z" fill="#ff8a3a" opacity=".9"/>
    <path d="M28 86 L28 60 M12 78 H28" stroke="#6a4a2a" stroke-width="2"/><path d="M128 66 L150 84 V86 H128Z" fill="#a0683a"/>
    ${palm(16, 88, 0.95, 6)}${palm(146, 90, 0.8, -6)}<path d="M80 92 q10 -4 18 0" stroke="#fff" stroke-width="1.6" fill="none" opacity=".8"/>
    <ellipse cx="108" cy="90" rx="9" ry="3" fill="#e0503a"/><path d="M100 90 Q108 78 116 90Z" fill="#ffd23f"/><path d="M108 90 V80" stroke="#6a4a2a" stroke-width="1.2"/>`),

  ferienvilla: () => art('ferienvilla', WIDE, ({ lin }) => `${sky(lin, '#ff9a5a', '#ffe0a8')}<circle cx="126" cy="30" r="12" fill="#fff3a0" opacity=".85"/>
    <path d="M0 58 Q40 50 80 56 T160 54 V100 H0Z" fill="${lin('hl', ['#4a9a4a', '#2a6a2a'])}"/>${ground(lin, 80, '#7ac060', '#3f8f2c')}
    <rect x="24" y="52" width="70" height="30" fill="${lin('w', ['#ffffff', '#d4d8de'])}" stroke="#8a929c" stroke-width="1"/>
    <rect x="18" y="46" width="52" height="7" fill="#e8ebef" stroke="#8a929c" stroke-width="1"/><rect x="60" y="34" width="46" height="24" fill="${lin('w2', ['#ffffff', '#d4d8de'])}" stroke="#8a929c" stroke-width="1"/><rect x="56" y="30" width="54" height="5" fill="#e8ebef" stroke="#8a929c" stroke-width="1"/>
    <rect x="28" y="56" width="38" height="22" fill="${lin('gl', ['#bfe6ff', '#4a7aa8'])}" stroke="#3a4a5a" stroke-width="1"/><path d="M47 56 V78 M28 67 H66" stroke="#3a4a5a" stroke-width="1"/><path d="M28 56 H46 L34 78 H28Z" fill="#fff" opacity=".25"/>
    <rect x="66" y="38" width="36" height="16" fill="${lin('gl2', ['#ffe0a8', '#c47a4a'])}" stroke="#3a4a5a" stroke-width="1"/><path d="M84 38 V54" stroke="#3a4a5a" stroke-width="1"/>
    <rect x="76" y="62" width="14" height="20" fill="#7a4a22" stroke="#3a2008" stroke-width=".8"/>
    <path d="M14 84 H152 L146 98 H20Z" fill="${lin('pool', ['#7ae6ff', '#1c9ad8'])}" stroke="#e8ebef" stroke-width="2.4"/><path d="M30 90 q8 -3 16 0 t16 0 t16 0 t16 0" fill="none" stroke="#fff" stroke-width="1.2" opacity=".8"/>
    <rect x="124" y="82" width="16" height="3" fill="#ffd23f" opacity="0"/><path d="M118 80 L128 70 H140 L132 80Z" fill="#fff" stroke="#8a929c" stroke-width=".8"/><path d="M122 70 L120 66" stroke="#8a929c" stroke-width="1"/>
    ${palm(10, 86, 0.9, 6)}${palm(152, 86, 0.85, -6)}${palm(100, 82, 0.6, 4)}${flowers(34, 82, 5)}`),

  caf: () => art('caf', WIDE, ({ lin }) => `${sky(lin)}
    <rect y="82" width="160" height="18" fill="${lin('st', ['#cfc8b8', '#9a9484'])}"/><rect y="80" width="160" height="4" fill="#e8e2d2"/>
    <rect x="22" y="22" width="116" height="60" fill="${lin('w', ['#c4693a', '#8a3a1c'])}" stroke="#3a1608" stroke-width="1.2"/>${brickWall(22, 22, 116, 60).replace(/opacity=".25"/g, 'opacity=".35"')}
    <rect x="18" y="16" width="124" height="8" fill="#5a2a14" stroke="#2a1008" stroke-width="1"/>
    <rect x="46" y="26" width="68" height="14" rx="2" fill="#2a1608" stroke="#ffd23f" stroke-width="1.4"/><text x="80" y="37" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="11" fill="#ffe27a" letter-spacing="1.5">CAFÉ</text>
    <rect x="28" y="46" width="52" height="32" fill="${lin('gl', ['#ffe9a8', '#c4893a'])}" stroke="#2a1608" stroke-width="1.6"/><path d="M54 46 V78" stroke="#2a1608" stroke-width="1.2"/>
    <circle cx="40" cy="64" r="6" fill="#fff" opacity=".9"/><path d="M36 64 h8 l-1 5 h-6z" fill="#8a5a2a"/><path d="M38 60 q1 -3 0 -5 M42 60 q1 -3 0 -5" stroke="#fff" stroke-width="1" fill="none"/>
    <path d="M62 78 V60 h10 v18" fill="#8a5a2a"/>
    ${door(92, 48, 18, 32, '#3a5a8a')}<rect x="94" y="50" width="14" height="14" fill="${lin('dg', ['#bfe6ff', '#4a7aa8'])}"/><circle cx="106" cy="66" r="1.2" fill="#ffd23f"/>
    <rect x="116" y="46" width="18" height="32" fill="${lin('gl3', ['#ffe9a8', '#c4893a'])}" stroke="#2a1608" stroke-width="1.4"/><rect x="120" y="58" width="10" height="9" rx="1" fill="#fff"/><path d="M122 58 V67 M127 58 V67" stroke="#c4893a" stroke-width="1"/>
    <path d="M24 44 H84 L88 58 H20Z" fill="#fff"/>${Array.from({ length: 6 }, (_, i) => `<path d="M${24 + i * 10} 44 H${34 + i * 10} L${33.4 + i * 10.4} 58 H${22 + i * 10.4}Z" fill="#d9232f"/>`).join('')}<path d="M20 58 q4 4 8 0 q4 4 8 0 q4 4 8 0 q4 4 8 0 q4 4 8 0 q4 4 8 0 q2 2 4 0" fill="#d9232f" stroke="#7a0d14" stroke-width=".6"/>
    <g><path d="M30 90 H46 M38 90 V98" stroke="#2a2f36" stroke-width="1.6"/><ellipse cx="38" cy="88" rx="9" ry="2.4" fill="#fff" stroke="#8a929c" stroke-width=".6"/><circle cx="34" cy="86" r="2" fill="#8a5a2a"/>
      <path d="M62 90 H78 M70 90 V98" stroke="#2a2f36" stroke-width="1.6"/><ellipse cx="70" cy="88" rx="9" ry="2.4" fill="#fff" stroke="#8a929c" stroke-width=".6"/><path d="M66 86 h5 l-1 3 h-3z" fill="#d9232f"/>
      <path d="M100 76 L120 60 M100 76 H120" stroke="#8a929c" stroke-width="0"/></g>
    <rect x="122" y="84" width="10" height="12" fill="#6a4a2a"/><path d="M127 84 C118 72 124 64 127 70 C131 62 136 74 127 84Z" fill="#3a9a3a"/>`),

  skihuette: () => art('skihuette', WIDE, ({ lin }) => `${sky(lin, '#6ab4f0', '#e8f6ff')}<circle cx="132" cy="18" r="8" fill="#fff9c0"/>
    <path d="M0 62 L30 20 L52 46 L72 14 L100 52 L124 28 L160 60 V80 H0Z" fill="${lin('mt', ['#9fb4cc', '#5a7a9a'])}"/><path d="M30 20 L20 34 L30 30 L38 36 Z M72 14 L60 32 L70 28 L80 34Z M124 28 L114 42 L124 38 L132 44Z" fill="#fff"/>
    <path d="M0 74 Q40 62 80 72 T160 68 V100 H0Z" fill="${lin('sn', ['#ffffff', '#d4e4f4'])}"/>
    ${[8, 22, 134, 148, 120].map((x, i) => pine(x, 80 + (i % 2) * 3, 1.4, true)).join('')}
    <rect x="48" y="54" width="62" height="30" fill="${lin('w', ['#a0683a', '#5a3414'])}" stroke="#2a1608" stroke-width="1.2"/>${logLines(48, 56, 62, 28)}
    <path d="M40 58 L79 28 L118 58Z" fill="${lin('r', ['#6a3a1c', '#3a1c08'])}" stroke="#1a0c04" stroke-width="1.4"/><path d="M38 59 Q60 42 79 28 Q98 42 120 59 Q98 52 79 40 Q60 52 38 59Z" fill="#fff" stroke="#c4d4e4" stroke-width=".6"/>
    <rect x="94" y="22" width="7" height="14" fill="#7a5a4a"/><path d="M92 22 H103 V20 H92Z" fill="#fff"/><path d="M98 18 q-3 -4 0 -7 t0 -6" fill="none" stroke="#fff" stroke-width="2.4" opacity=".8" stroke-linecap="round"/>
    <circle cx="79" cy="44" r="5" fill="#ffe27a" stroke="#2a1608" stroke-width="1"/><path d="M74 44 H84 M79 39 V49" stroke="#2a1608" stroke-width=".8"/>
    ${win(54, 62, 12, 12, '#ffe27a', '#e8ebef')}${door(82, 62, 12, 22, '#4a2c14')}${win(98, 62, 10, 12, '#ffe27a', '#e8ebef')}
    <path d="M40 86 H120 L112 92 H48Z" fill="#fff" opacity=".9"/><path d="M18 78 L10 92 M24 78 L16 92" stroke="#d9232f" stroke-width="2"/><path d="M8 76 L30 90" stroke="#3fa7ff" stroke-width="2.4" opacity="0"/>
    <path d="M130 70 L136 92 M138 70 L144 92" stroke="#2a2f36" stroke-width="1.4"/><ellipse cx="140" cy="96" rx="3" ry="1" fill="#2a2f36"/>`),

  bauernhof: () => art('bauernhof', WIDE, ({ lin }) => `${sky(lin)}${hills(60, '#8ac04a', '#5a9a30')}
    <path d="M0 74 Q40 66 80 72 T160 70 V100 H0Z" fill="${lin('fd', ['#e8c84a', '#b88a1c'])}"/>${Array.from({ length: 7 }, (_, i) => `<path d="M${-10 + i * 28} 100 L${40 + i * 12} 72" stroke="#a07a10" stroke-width="1.2" opacity=".6"/>`).join('')}
    <rect x="28" y="40" width="56" height="42" fill="${lin('b', ['#d9423a', '#8a1c14'])}" stroke="#3a0a06" stroke-width="1.2"/>
    <path d="M22 44 L56 20 L90 44Z" fill="${lin('r', ['#a8aeb8', '#5a626c'])}" stroke="#2a2f36" stroke-width="1.4"/><path d="M56 20 V44" stroke="#2a2f36" stroke-width=".8" opacity=".6"/>
    <rect x="42" y="52" width="28" height="30" fill="#e8e2d2" stroke="#3a0a06" stroke-width="1"/><path d="M42 52 L70 82 M70 52 L42 82 M42 52 H70 M42 82 H70" stroke="#d9423a" stroke-width="2.2"/><circle cx="56" cy="38" r="4" fill="#e8e2d2" stroke="#3a0a06" stroke-width=".8"/>
    <rect x="88" y="30" width="16" height="52" fill="${lin('sl', ['#cfd5dd', '#7a828c'], 'h')}" stroke="#4a525c" stroke-width="1"/><path d="M86 31 Q96 20 106 31Z" fill="#8a929c" stroke="#4a525c" stroke-width="1"/>${[40, 52, 64].map(y => `<path d="M88 ${y} H104" stroke="#4a525c" stroke-width=".8"/>`).join('')}
    <rect x="112" y="56" width="30" height="26" fill="${lin('h', ['#fff5e0', '#d8c8a0'])}" stroke="#8a7a50" stroke-width="1"/><path d="M108 58 L127 40 L146 58Z" fill="${lin('hr', ['#b8693a', '#6a3414'])}" stroke="#3a1c08" stroke-width="1.2"/>
    ${win(116, 62, 8, 9)}${door(130, 66, 8, 16, '#6a3a1c')}
    <ellipse cx="14" cy="80" rx="9" ry="6" fill="#e8c84a" stroke="#a07a10" stroke-width="1"/><path d="M8 78 H20 M9 82 H19" stroke="#a07a10" stroke-width=".8"/>
    <path d="M0 84 H160" stroke="#fff" stroke-width="1.4"/><g stroke="#fff" stroke-width="2">${Array.from({ length: 17 }, (_, i) => `<path d="M${i * 10} 80 V90"/>`).join('')}</g><path d="M0 82 H160 M0 87 H160" stroke="#fff" stroke-width="1.4"/>
    ${tree(150, 80, 1.5)}<g transform="translate(132 92)"><ellipse cx="0" cy="0" rx="6" ry="3.4" fill="#fff" stroke="#6a626c" stroke-width=".6"/><circle cx="-2" cy="-1" r="1.6" fill="#14161a"/><circle cx="3" cy="1" r="1.4" fill="#14161a"/><ellipse cx="-6.6" cy="-1" rx="2.6" ry="2" fill="#fff" stroke="#6a626c" stroke-width=".6"/></g>`),

  weingut: () => art('weingut', WIDE, ({ lin }) => `${sky(lin, '#6ab4f0', '#fff0cc')}${hills(54, '#9ab85a', '#7a9a3c')}
    <path d="M0 62 Q60 50 160 62 V100 H0Z" fill="${lin('sl', ['#8ab04a', '#4a7a22'])}"/>
    ${Array.from({ length: 9 }, (_, i) => `<path d="M${-8 + i * 22} 100 Q${20 + i * 14} 76 ${60 + i * 6} 62" fill="none" stroke="#2f6a1f" stroke-width="4"/><path d="M${-8 + i * 22} 100 Q${20 + i * 14} 76 ${60 + i * 6} 62" fill="none" stroke="#6ab04a" stroke-width="1.4" stroke-dasharray="2 3"/>`).join('')}
    ${Array.from({ length: 14 }, (_, i) => `<circle cx="${8 + i * 11}" cy="${88 - (i % 5) * 4}" r="1.4" fill="#7a2aa8"/>`).join('')}
    <rect x="52" y="44" width="58" height="28" fill="${lin('w', ['#f8e8c0', '#d8b888'])}" stroke="#8a6a3a" stroke-width="1"/>
    <path d="M46 46 L68 30 H94 L116 46Z" fill="${lin('r', ['#d9683a', '#8a3414'])}" stroke="#4a1c08" stroke-width="1.4"/>
    <rect x="94" y="28" width="12" height="22" fill="#e8d8b0" stroke="#8a6a3a" stroke-width="1"/><path d="M92 28 L100 20 L108 28Z" fill="#b8532a" stroke="#4a1c08" stroke-width="1"/>
    <path d="M58 72 V56 A7 7 0 0 1 72 56 V72Z" fill="#5a3a20" stroke="#f4ecd8" stroke-width="1.4"/>${win(80, 52, 9, 12)}${win(96, 52, 9, 12)}${shutter(80, 52, 9, 12, '#3a6a4a')}${shutter(96, 52, 9, 12, '#3a6a4a')}
    <path d="M60 36 Q64 40 60 46" stroke="#4a8a3a" stroke-width="2" fill="none"/>
    <g transform="translate(120 82)"><ellipse cx="0" cy="0" rx="8" ry="10" fill="${lin('ba', ['#c4894a', '#6a3a14'], 'h')}" stroke="#3a1c08" stroke-width="1"/><path d="M-8 -3 Q0 -1 8 -3 M-8 3 Q0 5 8 3" stroke="#3a1c08" stroke-width="1.4" fill="none"/></g>
    <g transform="translate(138 86)"><ellipse cx="0" cy="0" rx="6" ry="8" fill="${lin('ba2', ['#c4894a', '#6a3a14'], 'h')}" stroke="#3a1c08" stroke-width="1"/><path d="M-6 -2 Q0 0 6 -2 M-6 3 Q0 5 6 3" stroke="#3a1c08" stroke-width="1.2" fill="none"/></g>
    ${[16, 28, 140, 152].map((x, i) => `<path d="M${x} 82 Q${x - 3} 60 ${x} 42 Q${x + 3} 60 ${x} 82Z" fill="#1f5a2a"/>`).join('')}
    <path d="M108 60 q6 -2 8 4 q4 -6 8 0 q2 6 -2 8 q-4 2 -8 -2 q-6 4 -8 -2 q-2 -4 2 -8Z" fill="#8a2ab8" stroke="#4a1068" stroke-width=".8" transform="translate(6 20) scale(.8)"/>`),

  privatinsel: () => art('privatinsel', WIDE, ({ lin }) => `${sky(lin, '#3a9ae8', '#c8f0ff')}${cloud(40, 20, 1.2)}${cloud(120, 14, 1)}
    <rect y="52" width="160" height="48" fill="${lin('sea', ['#58d8f0', '#1c8ad0', '#0e5aa8'])}"/>
    <path d="M0 56 q10 -3 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 M0 66 q10 -3 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 M0 78 q10 -3 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0" fill="none" stroke="#fff" stroke-width="1" opacity=".5"/>
    <ellipse cx="80" cy="74" rx="62" ry="15" fill="${lin('lg', ['#8ae6d8', '#3ac0c8'])}" opacity=".7"/>
    <path d="M32 74 Q36 58 62 56 Q80 52 98 56 Q126 58 130 74 Q100 84 80 82 Q54 84 32 74Z" fill="${lin('is', ['#fff0b8', '#e8c878'])}" stroke="#c8a058" stroke-width="1"/>
    <path d="M44 70 Q60 58 80 60 Q104 58 118 70 Q100 66 80 66 Q58 66 44 70Z" fill="#5ab04a"/>
    ${palm(50, 68, 0.85, 5)}${palm(112, 70, 0.95, -5)}${palm(66, 62, 0.6, 3)}
    <rect x="68" y="56" width="26" height="12" fill="${lin('h', ['#d9a46a', '#8a5a2a'])}" stroke="#3a2008" stroke-width="1"/><path d="M64 58 L81 44 L98 58Z" fill="${lin('rf', ['#e8c070', '#a07a30'])}" stroke="#3a2008" stroke-width="1.2"/>
    ${door(78, 58, 6, 10, '#4a2c14')}${win(70, 59, 6, 6, '#a8d8f8', '#fff')}${win(87, 59, 6, 6, '#a8d8f8', '#fff')}
    <path d="M94 66 L140 82" stroke="#a0683a" stroke-width="5"/><path d="M96 63 L140 79" stroke="#c4894a" stroke-width="1.4"/><path d="M104 70 V80 M118 75 V85 M132 80 V90" stroke="#6a3a14" stroke-width="2"/>
    <path d="M124 54 q4 -4 8 0 L128 64Z" fill="#fff" opacity=".9"/><path d="M128 54 V68" stroke="#8a5a2a" stroke-width=".8"/><path d="M118 70 H140 L136 74 H122Z" fill="#e0503a"/>
    <path d="M10 92 q8 -3 16 0 M130 94 q8 -3 16 0" fill="none" stroke="#fff" stroke-width="1.4" opacity=".6"/>`),

  wolkenkratzer: () => art('wolkenkratzer', WIDE, ({ lin }) => `<rect width="160" height="100" fill="${lin('sky', ['#2a4aa8', '#ff9a7a', '#ffe0b0'])}"/><circle cx="130" cy="64" r="14" fill="#fff3c0" opacity=".7"/>${cloud(30, 24, 1, 0.5)}${cloud(120, 18, .8, 0.4)}
    ${[[6, 36, 18, '#5a6a8a'], [26, 52, 16, '#6a7a9a'], [118, 44, 18, '#5a6a8a'], [138, 58, 20, '#6a7a9a'], [100, 60, 14, '#7a8aaa']].map(([x, y, w, c]) => `<rect x="${x}" y="${y}" width="${w}" height="${96 - y}" fill="${c}"/>${Array.from({ length: Math.floor((96 - y) / 6) }, (_, r) => `<path d="M${x + 2} ${y + 4 + r * 6} H${x + w - 2}" stroke="#ffe27a" stroke-width="1.6" stroke-dasharray="2 2.4" opacity=".7"/>`).join('')}`).join('')}
    <path d="M58 96 V20 L66 10 H94 L102 20 V96Z" fill="${lin('tw', ['#7ad0ff', '#2a6ac0', '#14388a'], 'h')}" stroke="#0a1c5a" stroke-width="1.4"/>
    <path d="M80 10 V0" stroke="#cfd5dd" stroke-width="2"/><circle cx="80" cy="1.6" r="1.6" fill="#ff4a4a"/>
    ${Array.from({ length: 16 }, (_, i) => `<path d="M59 ${24 + i * 4.6} H101" stroke="#fff" stroke-width=".5" opacity=".5"/>`).join('')}${Array.from({ length: 5 }, (_, i) => `<path d="M${64 + i * 8} 14 V96" stroke="#fff" stroke-width=".5" opacity=".45"/>`).join('')}
    <path d="M60 22 L66 12 H80 L66 96 H60Z" fill="#fff" opacity=".22"/>
    <rect x="52" y="30" width="6" height="66" fill="#4a6aa8"/><rect x="102" y="38" width="6" height="58" fill="#4a6aa8"/>
    <rect y="94" width="160" height="6" fill="#14183a"/><path d="M0 96 H160" stroke="#ffd23f" stroke-width="1" stroke-dasharray="6 5"/>`),

  schlossneuschwanstein: () => art('schlossneuschwanstein', WIDE, ({ lin }) => `${sky(lin, '#4a9ae8', '#e8f6ff')}
    <path d="M0 60 L26 26 L48 46 L70 14 L96 44 L124 20 L160 52 V80 H0Z" fill="${lin('al', ['#a8bcd4', '#5a7a9c'])}"/><path d="M70 14 L60 32 L70 28 L78 34Z M26 26 L18 38 L26 34Z M124 20 L114 36 L124 32 L132 38Z" fill="#fff"/>
    <path d="M0 76 Q30 60 56 68 T110 66 T160 70 V100 H0Z" fill="${lin('fo', ['#3a8a3a', '#1f5a2a'])}"/>${[8, 20, 140, 152, 34, 128].map((x, i) => pine(x, 84 + (i % 2) * 3, 1.5)).join('')}
    <path d="M44 88 L56 66 L70 62 H106 L120 68 L128 88Z" fill="${lin('rk', ['#a8a090', '#5a5448'])}" stroke="#2a2418" stroke-width="1"/>
    <rect x="62" y="40" width="40" height="26" fill="${lin('w', ['#ffffff', '#d8dce4'])}" stroke="#8a929c" stroke-width="1"/>
    <rect x="52" y="48" width="14" height="22" fill="${lin('w2', ['#ffffff', '#d8dce4'])}" stroke="#8a929c" stroke-width="1"/><path d="M50 48 L59 34 L68 48Z" fill="${lin('tr', ['#5a8ad0', '#2a4a90'])}" stroke="#14286a" stroke-width="1"/>
    <rect x="98" y="30" width="16" height="38" fill="${lin('w3', ['#ffffff', '#d8dce4'])}" stroke="#8a929c" stroke-width="1"/><path d="M95 30 L106 6 L117 30Z" fill="${lin('tr2', ['#5a8ad0', '#2a4a90'])}" stroke="#14286a" stroke-width="1"/><path d="M106 6 V0" stroke="#8a929c" stroke-width="1.4"/><path d="M106 0 l5 2 l-5 2z" fill="#3fa7ff"/>
    <rect x="76" y="26" width="14" height="16" fill="${lin('w4', ['#ffffff', '#d8dce4'])}" stroke="#8a929c" stroke-width="1"/><path d="M73 26 L83 10 L93 26Z" fill="${lin('tr3', ['#5a8ad0', '#2a4a90'])}" stroke="#14286a" stroke-width="1"/>
    <rect x="116" y="50" width="12" height="20" fill="${lin('w5', ['#ffffff', '#d8dce4'])}" stroke="#8a929c" stroke-width="1"/><path d="M114 50 L122 38 L130 50Z" fill="${lin('tr4', ['#5a8ad0', '#2a4a90'])}" stroke="#14286a" stroke-width="1"/>
    ${[[66, 46], [76, 46], [86, 46], [58, 56], [102, 40], [108, 50], [80, 32], [120, 58]].map(([x, y]) => `<path d="M${x} ${y + 6} V${y + 2} A2 2 0 0 1 ${x + 4} ${y + 2} V${y + 6}Z" fill="#3a5a8a"/>`).join('')}
    <path d="M62 40 h4 v-3 h4 v3 h4 v-3 h4 v3 h4 v-3 h4 v3 h4 v-3 h4 v3 h4 v-3 h4" fill="none" stroke="#8a929c" stroke-width="1"/>
    ${cloud(20, 14, 1, 0.8)}${cloud(138, 22, .9, 0.8)}`),

  burjkhalifa: () => art('burjkhalifa', WIDE, ({ lin }) => `<rect width="160" height="100" fill="${lin('sky', ['#4a8ad8', '#bfe0f8', '#f8e8c8'])}"/>${cloud(24, 22, 1, 0.6)}${cloud(132, 30, .9, 0.6)}
    <path d="M0 80 Q40 74 80 80 T160 78 V100 H0Z" fill="${lin('sd', ['#e8c888', '#c49a58'])}"/>
    ${[[6, 66, 12], [20, 58, 10], [32, 70, 14], [112, 62, 12], [126, 54, 12], [140, 66, 14], [150, 58, 8]].map(([x, y, w], i) => `<rect x="${x}" y="${y}" width="${w}" height="${88 - y}" fill="${lin('b' + i, ['#a8c0d8', '#6a8aa8'], 'h')}" stroke="#4a6a88" stroke-width=".6"/>`).join('')}
    <path d="M74 88 V60 L70 60 V44 L74 44 V30 L77 30 V20 L79 20 V8 L80 0 L81 8 V20 L83 20 V30 L86 30 V44 L90 44 V60 L86 60 V88Z" fill="${lin('t', ['#f4f8fc', '#9ab8d4', '#5a7a9c'], 'h')}" stroke="#3a5a78" stroke-width=".8"/>
    <path d="M80 0 V88" stroke="#3a5a78" stroke-width=".6" opacity=".6"/><path d="M74 44 H90 M74 60 H86 M77 30 H83 M70 60 L74 66 M90 60 L86 66" stroke="#3a5a78" stroke-width=".6"/>
    ${Array.from({ length: 14 }, (_, i) => `<path d="M${75 + (i % 3)} ${12 + i * 5.4} H${85 - (i % 3)}" stroke="#fff" stroke-width=".5" opacity=".55"/>`).join('')}
    <path d="M60 88 L74 60 V88Z M100 88 L86 60 V88Z" fill="${lin('w', ['#c4d8ec', '#7a98b4'])}" stroke="#3a5a78" stroke-width=".8"/><path d="M52 88 L70 66 V88Z M108 88 L90 66 V88Z" fill="${lin('w2', ['#b4cce4', '#6a88a4'])}" stroke="#3a5a78" stroke-width=".8"/>
    <rect y="88" width="160" height="12" fill="${lin('rd', ['#8a929c', '#4a525c'])}"/><path d="M0 94 H160" stroke="#ffd23f" stroke-width="1" stroke-dasharray="6 5"/>${palm(26, 96, 0.8, 4)}${palm(134, 96, 0.8, -4)}
    <path d="M56 88 q-6 -10 4 -16" fill="none" stroke="#6ac8f0" stroke-width="2.4" opacity=".7"/><path d="M104 88 q6 -10 -4 -16" fill="none" stroke="#6ac8f0" stroke-width="2.4" opacity=".7"/>`),
};
