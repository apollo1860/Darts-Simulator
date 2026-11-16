// Kleine Szenen für die Dilemma-Entscheidungen (Version 107, eigene SVGs, 160 × 100)
import { art, WIDE, shadow, OUT } from './core.js';

// Neutraler Hintergrund: Veranstaltungshalle mit Scheinwerfern und Zuschauer-Silhouetten
const stands = (lin, rad) => `<rect width="160" height="100" fill="${lin('hw', ['#2a2350', '#151226'])}"/>
  <path d="M28 0 L4 100 H52Z M132 0 L108 100 H156Z" fill="#fff6c8" opacity=".09"/>
  ${[[18, 14, 3], [46, 8, 2], [74, 18, 2.5], [104, 10, 2], [140, 16, 3], [60, 30, 1.6], [124, 32, 1.8]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#ffd36e" opacity=".55"/>`).join('')}
  <ellipse cx="80" cy="96" rx="90" ry="34" fill="${rad('gl', ['#6a4fd0', '#6a4fd000'])}" opacity=".5"/>
  ${Array.from({ length: 12 }, (_, i) => `<circle cx="${i * 14 + 4}" cy="${86 + (i % 2) * 3}" r="7" fill="#0c0a18"/><rect x="${i * 14 - 5}" y="${90 + (i % 2) * 3}" width="18" height="14" rx="6" fill="#0c0a18"/>`).join('')}`;

const DRAW = {
  // Fans: Autogramm auf den Block
  autograph: ({ lin, rad }) => `${stands(lin, rad)}
    <g transform="rotate(-14 80 64)"><rect x="56" y="38" width="48" height="56" rx="3" fill="${lin('pa', ['#fff8e2', '#f0e2b8'])}" stroke="${OUT}" stroke-width="1.2"/>
    ${[0, 1, 2, 3, 4, 5].map(i => `<circle cx="${62 + i * 7.5}" cy="38" r="2.2" fill="none" stroke="#5b5b5b" stroke-width="1.4"/>`).join('')}
    <path d="M64 70 q6 -16 9 -2 q3 10 7 -6 q2 -6 5 4 q2 6 8 -2" fill="none" stroke="#1d2430" stroke-width="2" stroke-linecap="round"/></g>
    <g transform="rotate(32 108 52)"><rect x="104" y="22" width="5" height="44" rx="2" fill="#26292e"/><path d="M104 66 l2.5 6 l2.5 -6z" fill="#26292e"/></g>`,
  // Fans: Selfie mit Fans
  selfie: ({ lin, rad }) => `${stands(lin, rad)}
    <rect x="52" y="18" width="56" height="78" rx="8" fill="#1d2430"/><rect x="56" y="24" width="48" height="64" rx="3" fill="${lin('sc', ['#8fd0ff', '#d9f1ff'])}"/>
    ${[[70, 52, '#f2b48a', '#e74c3c'], [90, 50, '#d99a6c', '#2e86de'], [80, 64, '#f6c9a2', '#f1c40f']].map(([x, y, sk, sh]) => `<rect x="${x - 8}" y="${y + 6}" width="16" height="14" rx="5" fill="${sh}"/><circle cx="${x}" cy="${y}" r="7" fill="${sk}"/><path d="M${x - 3} ${y + 2} q3 3 6 0" stroke="#5a3a22" stroke-width="1.2" fill="none"/>`).join('')}
    <circle cx="80" cy="21" r="1.6" fill="#555"/><path d="M118 20 l6 -6 M122 28 l8 -2 M116 12 l2 -8" stroke="#fff27a" stroke-width="2.5" stroke-linecap="round"/>`,
  // Manager: Strategiegespräch
  meeting: ({ lin }) => `<rect width="160" height="100" fill="${lin('wa', ['#e9eef3', '#cfd8e1'])}"/><rect x="18" y="12" width="70" height="44" rx="2" fill="#fff" stroke="#9aa6b2" stroke-width="1.5"/>
    <path d="M26 48 L40 38 L52 42 L66 26 L80 20" fill="none" stroke="#2bb34a" stroke-width="2.5"/><path d="M76 18 l6 1 l-2 6" fill="none" stroke="#2bb34a" stroke-width="2.5"/>
    ${[30, 44, 58, 72].map((x, i) => `<rect x="${x - 3}" y="${50 - [6, 12, 9, 18][i]}" width="6" height="${[6, 12, 9, 18][i]}" fill="#4f8fe0" opacity=".6"/>`).join('')}
    <rect y="66" width="160" height="34" fill="${lin('tb', ['#8a5a34', '#5e3a1f'])}"/>
    <rect x="96" y="58" width="40" height="28" rx="1.5" fill="#fff" transform="rotate(-6 116 72)" stroke="#9aa6b2"/><path d="M102 64 h26 M102 70 h22 M102 76 h18" stroke="#9aa6b2" stroke-width="1.5" transform="rotate(-6 116 72)"/>
    <rect x="128" y="50" width="4" height="26" rx="1.5" fill="#1d2430" transform="rotate(24 130 63)"/>`,
  // Manager: Golfrunde
  golf: ({ lin }) => `<rect width="160" height="100" fill="${lin('sk', ['#6bb8f0', '#d4ecff'])}"/><path d="M0 62 Q50 46 100 58 T160 54 V100 H0Z" fill="#5fae45"/><path d="M0 74 Q60 62 160 72 V100 H0Z" fill="#4a9636"/>
    <ellipse cx="112" cy="70" rx="26" ry="6" fill="#7fd16a"/><ellipse cx="112" cy="70" rx="3" ry="1.4" fill="#1d2430"/>
    <rect x="111.3" y="34" width="1.6" height="36" fill="#eee"/><path d="M113 34 l16 5 l-16 5z" fill="#e74c3c"/>
    <circle cx="46" cy="84" r="4" fill="#fff" stroke="#b9c0c7"/>${shadow(46, 89, 6, 1.4)}
    <g transform="rotate(-38 40 60)"><rect x="38" y="20" width="3" height="58" fill="#9aa1a8"/><path d="M36 78 h12 v5 h-12z" fill="#5b6168"/></g>`,
  // Sponsoren: Fotoshooting
  photo: ({ lin }) => `<rect width="160" height="100" fill="${lin('bg', ['#2d3440', '#151a22'])}"/><rect x="18" y="10" width="124" height="60" rx="3" fill="#f4f6f8"/>
    ${[0, 1, 2].map(r => [0, 1, 2, 3].map(c => `<text x="${34 + c * 31}" y="${30 + r * 17}" font-size="9" font-weight="700" text-anchor="middle" fill="#c0392b" opacity=".7">LOGO</text>`).join('')).join('')}
    <rect x="58" y="56" width="44" height="30" rx="5" fill="#1d2430"/><rect x="70" y="50" width="14" height="8" rx="2" fill="#1d2430"/><circle cx="80" cy="71" r="10" fill="#3c4654" stroke="#7d8794" stroke-width="2"/><circle cx="80" cy="71" r="4.5" fill="#79b8ff"/>
    <rect x="94" y="60" width="6" height="4" fill="#ffe46b"/><path d="M130 60 l10 -6 M132 70 l12 0 M130 80 l10 6" stroke="#fff27a" stroke-width="2.5" stroke-linecap="round"/>`,
  // Sponsoren: Messestand mit Dartscheibe
  booth: ({ lin }) => `<rect width="160" height="100" fill="${lin('ha', ['#d9dfe5', '#aeb8c2'])}"/><rect y="80" width="160" height="20" fill="#7d8894"/>
    <rect x="20" y="14" width="120" height="16" rx="2" fill="#c0392b"/><text x="80" y="26" font-size="10" font-weight="800" text-anchor="middle" fill="#fff">SPONSOR</text>
    <rect x="24" y="30" width="112" height="50" fill="#f7f8fa" stroke="#9aa6b2"/>
    <circle cx="80" cy="54" r="17" fill="#1d2430"/>${[13, 9, 5].map((r, i) => `<circle cx="80" cy="54" r="${r}" fill="${['#e9d7a5', '#2a9d4a', '#e74c3c'][i]}"/>`).join('')}<circle cx="80" cy="54" r="2" fill="#2a9d4a"/>
    <rect x="34" y="62" width="22" height="18" fill="#2e86de"/><rect x="104" y="62" width="22" height="18" fill="#2e86de"/>`,
  // Freundin/Freund: Abendessen bei Kerzenschein
  dinner: ({ lin, rad }) => `<rect width="160" height="100" fill="${lin('nt', ['#2b1d3a', '#5a2e4a'])}"/><circle cx="80" cy="40" r="40" fill="${rad('gl', [[0, '#ffd27a'], [1, 'rgba(255,210,122,0)']])}" opacity=".55"/>
    <rect y="62" width="160" height="38" fill="${lin('tc', ['#f4f0ea', '#d8cfc3'])}"/>
    <ellipse cx="48" cy="76" rx="18" ry="6" fill="#fff" stroke="#c9c2b8"/><ellipse cx="112" cy="76" rx="18" ry="6" fill="#fff" stroke="#c9c2b8"/><ellipse cx="48" cy="75" rx="9" ry="3" fill="#c0603a"/><ellipse cx="112" cy="75" rx="9" ry="3" fill="#7aa64a"/>
    <rect x="76" y="44" width="8" height="24" fill="#fff6dc"/><path d="M80 34 q-4 6 0 10 q4 -4 0 -10z" fill="#ffb02e"/>
    ${[64, 96].map(x => `<path d="M${x - 4} 50 h8 q0 8 -4 9 q-4 -1 -4 -9z" fill="#8e1b2e" opacity=".85"/><rect x="${x - 0.6}" y="59" width="1.2" height="7" fill="#ddd"/><rect x="${x - 3}" y="66" width="6" height="1.4" fill="#ddd"/>`).join('')}
    <path d="M24 30 q2 -6 6 -2 q4 -4 6 2 q-6 8 -6 8 q0 0 -6 -8z" fill="#e74c3c" opacity=".7"/>`,
  // Freundin/Freund: Kino
  cinema: ({ lin }) => `<rect width="160" height="100" fill="#120e18"/><rect x="16" y="8" width="128" height="50" rx="2" fill="${lin('lw', ['#5fb0ff', '#c8e6ff'])}"/>
    <path d="M30 50 q20 -20 40 -6 q20 14 40 -10 q14 -14 26 4" fill="none" stroke="#fff" stroke-width="2" opacity=".6"/>
    ${[0, 1, 2, 3, 4, 5, 6].map(i => `<rect x="${8 + i * 22}" y="70" width="18" height="30" rx="4" fill="#7a1f2b"/>`).join('')}
    <path d="M62 64 h20 l-3 26 h-14z" fill="#fff"/>${[0, 1, 2].map(i => `<rect x="${64 + i * 6}" y="64" width="3" height="26" fill="#e74c3c" opacity=".85"/>`).join('')}
    ${[[66, 60], [72, 57], [78, 60], [69, 55], [75, 54]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="#fff6c8" stroke="#e8d27a" stroke-width=".8"/>`).join('')}
    <circle cx="100" cy="66" r="7" fill="#2a2030"/><circle cx="116" cy="66" r="7" fill="#2a2030"/><path d="M104 61 q4 -4 8 0" stroke="#e74c3c" stroke-width="2" fill="none"/>`,
};
export const dilemmaArt = key => (DRAW[key] ? art(`dl-${key}`, WIDE, DRAW[key]) : '');
