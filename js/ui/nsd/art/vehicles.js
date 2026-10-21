// Fahrzeuge als eigene Illustrationen (100 × 100, Seitenansicht nach rechts)
import { art, BOX, shadow, wheel, water, OUT } from './core.js';

const GLASS = ['#bfe6ff', '#4a7aa8'];

export const VEHICLE_ART = {
  limeprimeabo: () => art('limeprimeabo', BOX, ({ lin }) => `${shadow(50, 92, 36, 3)}
    <path d="M70 80 L78 22" stroke="#2a2f36" stroke-width="5" stroke-linecap="round"/><path d="M70 80 L78 22" stroke="#6a727c" stroke-width="1.6" stroke-linecap="round" transform="translate(-1 0)"/>
    <path d="M70 22 H88" stroke="#1d2128" stroke-width="5" stroke-linecap="round"/><rect x="87" y="19" width="4" height="7" rx="2" fill="#1d2128"/><circle cx="84" cy="18" r="3.6" fill="#fff3a0" stroke="#7a6a00" stroke-width=".8"/>
    <path d="M14 72 H66 Q72 72 72 78 H14Z" fill="${lin('d', ['#b8ff4a', '#4fa800'])}" stroke="#2a6a00" stroke-width="1.4"/><rect x="18" y="72" width="40" height="3" fill="#3a7a00" opacity=".5"/>
    <path d="M14 70 Q22 60 32 66 L30 72 H14Z" fill="#8a929c"/>
    <rect x="72" y="36" width="9" height="14" rx="2" fill="${lin('bt', ['#c8ff7a', '#52b400'])}" stroke="#2a6a00" stroke-width="1"/><text x="76.5" y="46" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="8" fill="#1b4a00">L</text>
    ${wheel(20, 82, 9, '#c8ff7a')}${wheel(72, 82, 9, '#c8ff7a')}`),

  tretroller: () => art('tretroller', BOX, ({ lin }) => `${shadow(50, 92, 36, 3)}
    <path d="M70 80 L76 16" stroke="${lin('st', ['#e8ebef', '#8a929c'], 'h')}" stroke-width="4.4" stroke-linecap="round"/><path d="M66 16 H88" stroke="#2a2f36" stroke-width="5" stroke-linecap="round"/>
    <path d="M12 74 H62 Q70 74 70 80 H12Z" fill="${lin('d', ['#4ab0ff', '#1450b8'])}" stroke="#0a2a6a" stroke-width="1.4"/><rect x="16" y="74" width="40" height="2.6" fill="#fff" opacity=".4"/>
    <path d="M10 70 Q14 64 22 66 L22 76 H10Z" fill="#2a2f36"/>
    ${wheel(18, 82, 10, '#ff4a4a')}${wheel(72, 82, 10, '#ff4a4a')}`),

  fahrrad: () => art('fahrrad', BOX, ({ lin }) => `${shadow(50, 91, 40, 3)}
    ${wheel(22, 68, 20, '#f4f6f9')}${wheel(78, 68, 20, '#f4f6f9')}
    <g fill="none" stroke="${lin('fr', ['#e8ebef', '#5a626c'])}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M22 68 L44 68 L36 42 H66 L44 68 M22 68 L36 42 M66 42 L78 68"/></g>
    <path d="M44 68 L36 42 H66 L44 68Z" fill="#7ad0ff" opacity=".25"/>
    <path d="M66 42 L64 34 M60 34 H74" stroke="#2a2f36" stroke-width="3.4" stroke-linecap="round"/><path d="M74 34 Q80 34 80 40" stroke="#2a2f36" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M28 38 Q36 34 44 38 L42 41 H30Z" fill="#2a2f36"/><path d="M36 41 V44" stroke="#8a929c" stroke-width="2.4"/>
    <circle cx="44" cy="68" r="5" fill="#8a929c" stroke="#3a4048" stroke-width="1.4"/><path d="M44 68 L40 78 M44 68 L48 58" stroke="#3a4048" stroke-width="2.6" stroke-linecap="round"/><rect x="36" y="77" width="9" height="3" rx="1" fill="#2a2f36"/>
    <path d="M24 56 Q22 46 32 46" fill="none" stroke="#2a2f36" stroke-width="0"/>
    <path d="M12 68 Q22 50 34 54" fill="none" stroke="#e8ebef" stroke-width="1.6" opacity=".7"/>`),

  haengegleiter: () => art('haengegleiter', BOX, ({ lin }) => `${shadow(52, 96, 16, 2)}
    <path d="M6 24 L92 54 L34 62Z" fill="${lin('w', [[0, '#e6431c'], [.18, '#e6431c'], [.18, '#ff9a1f'], [.36, '#ff9a1f'], [.36, '#ffe14d'], [.55, '#ffe14d'], [.55, '#fff'], [.7, '#fff'], [.7, '#ff9a1f'], [1, '#e6431c']], 'd')}" stroke="${OUT}" stroke-width="1.8" stroke-linejoin="round"/>
    <path d="M6 24 L34 62" stroke="${OUT}" stroke-width="1.8"/><path d="M6 24 L66 58" stroke="#6a1a08" stroke-width="1" opacity=".7"/>
    <path d="M44 56 L48 70 M62 58 L56 70" stroke="${OUT}" stroke-width="1.4"/>
    <circle cx="52" cy="74" r="4" fill="#ffd7b0" stroke="${OUT}" stroke-width="1"/><path d="M44 78 Q52 76 62 80 L72 86 L68 88 L58 84 L50 86 L46 92 L42 90Z" fill="#14161a"/>
    <path d="M50 70 L46 66 M52 70 L56 66" stroke="${OUT}" stroke-width="1.6"/>`),

  roller: () => art('roller', BOX, ({ lin }) => `${shadow(50, 92, 38, 3)}
    <path d="M14 66 C10 52 22 48 34 52 L50 54 L54 70 H36 C32 80 16 80 14 66Z" fill="${lin('b', ['#58e048', '#1c7a14'])}" stroke="#0e4a0a" stroke-width="1.4"/>
    <path d="M26 50 Q40 40 56 48 L50 54 L30 52Z" fill="#23262c"/>
    <path d="M52 72 H70 L68 80 H52Z" fill="#8a929c" stroke="#3a4048" stroke-width="1"/>
    <path d="M56 36 L66 28 L72 34 L66 76 L56 76Z" fill="${lin('sh', ['#58e048', '#1c7a14'], 'h')}" stroke="#0e4a0a" stroke-width="1.4"/>
    <path d="M64 28 L70 20 M62 22 H78" stroke="#2a2f36" stroke-width="3.4" stroke-linecap="round"/><ellipse cx="72" cy="36" rx="4" ry="5" fill="#fff3a0" stroke="#7a6a00" stroke-width="1"/>
    <path d="M68 76 L78 70" stroke="#2a2f36" stroke-width="3"/><path d="M12 72 Q8 66 14 64" fill="none" stroke="#8a929c" stroke-width="3" stroke-linecap="round"/>
    ${wheel(26, 80, 10)}${wheel(76, 80, 10)}`),

  jetski: () => art('jetski', BOX, ({ lin }) => `${shadow(50, 94, 40, 3)}
    <path d="M6 66 C16 58 44 52 72 50 L92 46 C96 60 90 74 76 78 L22 80 C12 80 6 74 6 66Z" fill="${lin('h', ['#ffffff', '#c4ccd6'])}" stroke="#5a626c" stroke-width="1.6"/>
    <path d="M10 70 C30 66 60 64 90 62" fill="none" stroke="#2a8ae0" stroke-width="3"/>
    <path d="M30 52 C32 40 52 40 60 52Z" fill="${lin('sx', ['#4ab0ff', '#1450b8'])}" stroke="#0a2a6a" stroke-width="1.2"/>
    <path d="M62 50 L66 36 H76 L80 48Z" fill="${lin('c', ['#4ab0ff', '#1450b8'])}" stroke="#0a2a6a" stroke-width="1.2"/><path d="M66 36 L64 30 H78" stroke="#2a2f36" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M70 34 L74 20 Q80 20 82 30" fill="#bfe6ff" opacity=".6" stroke="#5a8ab0" stroke-width="1"/>
    ${water(78, '#7ad0ff', '#1c72c4')}
    <path d="M4 80 q5 -6 10 0 q5 -6 10 0" stroke="#fff" stroke-width="2" fill="none" opacity=".9"/><circle cx="10" cy="72" r="1.6" fill="#fff"/><circle cx="16" cy="68" r="1.2" fill="#fff"/>`),

  kleinwagen: () => art('kleinwagen', BOX, ({ lin }) => `${shadow(50, 91, 42, 3)}
    <path d="M8 70 V58 C8 52 12 48 18 46 L28 30 C32 24 40 22 48 22 H62 C70 22 76 28 80 36 L86 46 C92 48 95 56 95 64 V72 C95 76 91 78 86 78 H14 C10 78 8 74 8 70Z" fill="${lin('b', ['#ffe45a', '#e0a400'])}" stroke="#7a5a00" stroke-width="1.6"/>
    <path d="M30 44 L36 29 C38 26 42 25 48 25 H60 C66 25 70 29 73 36 L76 44Z" fill="${lin('g', GLASS)}" stroke="#3a4a5a" stroke-width="1.2"/><path d="M53 25 V44" stroke="#3a4a5a" stroke-width="1.4"/>
    <path d="M8 62 H95" stroke="#7a5a00" stroke-width="1" opacity=".5"/><rect x="40" y="52" width="9" height="2.4" rx="1.2" fill="#7a5a00"/>
    <path d="M84 50 L93 56 L88 60 L82 54Z" fill="#fffbe0" stroke="#7a5a00" stroke-width="1"/><rect x="8" y="64" width="5" height="6" rx="1.6" fill="#ff4a4a"/>
    <path d="M8 74 H95 V78 H8Z" fill="#2a2f36"/>
    <path d="M15 36 L25 30" stroke="#fff" stroke-width="2" opacity="0"/><path d="M32 30 Q44 26 56 28" stroke="#fff" stroke-width="2" opacity=".4" fill="none"/>
    ${wheel(28, 78, 11)}${wheel(74, 78, 11)}`),

  segelboot: () => art('segelboot', BOX, ({ lin }) => `<path d="M48 6 V76" stroke="#5a626c" stroke-width="2.2"/>
    <path d="M46 10 Q22 40 12 72 H46Z" fill="${lin('m', ['#f4f6f9', '#aab2bd'], 'h')}" stroke="#6a727c" stroke-width="1.4"/>
    <path d="M50 14 Q76 44 90 72 H50Z" fill="${lin('j', ['#e8ebef', '#8d949f'], 'h')}" stroke="#6a727c" stroke-width="1.4"/>
    <text x="30" y="52" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="7" fill="#3a4a8a" opacity=".8">958</text>
    <path d="M18 62 Q32 58 44 40 M60 40 Q70 52 82 62" fill="none" stroke="#fff" stroke-width="1" opacity=".6"/>
    <path d="M6 76 H92 L82 88 H18Z" fill="${lin('h', ['#ffffff', '#c4ccd6'])}" stroke="#5a626c" stroke-width="1.4"/><path d="M10 80 H90" stroke="#d9232f" stroke-width="2.4"/>
    <path d="M48 6 L52 6 L50 2Z" fill="#d9232f"/>${water(86, '#7ad0ff', '#1c72c4')}`),

  fischerboot: () => art('fischerboot', BOX, ({ lin }) => `<path d="M48 22 L8 4 M60 22 L96 6" stroke="#8a929c" stroke-width="1.4"/>
    <path d="M4 60 L84 52 C92 52 96 56 94 62 L84 78 H18Z" fill="${lin('h', ['#ffffff', '#c4ccd6'])}" stroke="#5a626c" stroke-width="1.6"/>
    <path d="M12 66 L90 60" stroke="#d9232f" stroke-width="3.2"/><path d="M18 78 H84 L88 72 H14Z" fill="#1c3f94"/>
    <path d="M30 54 L34 34 H68 L72 52Z" fill="${lin('cb', ['#ffffff', '#c4ccd6'])}" stroke="#5a626c" stroke-width="1.4"/>
    <path d="M36 38 H64 L66 48 H34Z" fill="${lin('g', GLASS)}" stroke="#3a4a5a" stroke-width="1"/><path d="M50 38 V48" stroke="#3a4a5a" stroke-width="1"/>
    <rect x="40" y="22" width="26" height="12" rx="2" fill="#fff" stroke="#5a626c" stroke-width="1.2"/><rect x="43" y="25" width="20" height="5" fill="${lin('g2', GLASS)}"/>
    <path d="M44 22 V10 M62 22 V10 M40 10 H66" stroke="#8a929c" stroke-width="1.6"/><path d="M52 10 V4" stroke="#8a929c" stroke-width="1.4"/><circle cx="52" cy="4" r="1.6" fill="#d9232f"/>
    ${water(80, '#7ad0ff', '#1c72c4')}`),

  motorrad: () => art('motorrad', BOX, ({ lin }) => `${shadow(50, 91, 40, 3)}
    ${wheel(22, 70, 17, '#cfd5dd')}${wheel(80, 70, 17, '#cfd5dd')}
    <path d="M80 70 L70 38" stroke="${lin('f', ['#e8ebef', '#7a828c'], 'h')}" stroke-width="3.6" stroke-linecap="round"/>
    <path d="M62 36 H78" stroke="#2a2f36" stroke-width="3.6" stroke-linecap="round"/><path d="M70 40 L82 38 L80 46 L70 46Z" fill="#fff3a0" stroke="#7a6a00" stroke-width="1"/>
    <path d="M30 56 L44 50 L66 46 L68 38 L48 38 C40 38 34 44 30 56Z" fill="${lin('t', ['#ff5a4a', '#9a0e18'])}" stroke="#4a0610" stroke-width="1.4"/>
    <path d="M22 52 C28 46 38 46 46 48 L40 54 L22 56Z" fill="#23262c" stroke="#0a0b0e" stroke-width="1"/>
    <rect x="38" y="56" width="26" height="18" rx="4" fill="${lin('e', ['#aab2bd', '#4a525c'])}" stroke="#2a2f36" stroke-width="1.2"/>
    ${[0, 1, 2].map(i => `<line x1="42" y1="${61 + i * 4}" x2="60" y2="${61 + i * 4}" stroke="#2a2f36" stroke-width="1"/>`).join('')}
    <path d="M40 72 L10 66 L10 70 L40 76Z" fill="${lin('x', ['#f4f6f9', '#8d949f'])}" stroke="#4a525c" stroke-width="1"/>
    <path d="M22 70 L40 66" stroke="#2a2f36" stroke-width="3" opacity="0"/><path d="M22 70 L44 62" stroke="#4a525c" stroke-width="2.4"/>`),

  van: () => art('van', BOX, ({ lin }) => `${shadow(50, 91, 44, 3)}
    <path d="M4 74 V38 C4 32 8 28 14 28 H58 C66 28 72 32 78 44 L90 50 C94 52 96 56 96 62 V74Z" fill="${lin('b', ['#ffffff', '#c4ccd6'])}" stroke="#5a626c" stroke-width="1.6"/>
    <path d="M62 32 L76 48 H58 V32Z" fill="${lin('g', GLASS)}" stroke="#3a4a5a" stroke-width="1.2"/>
    <rect x="10" y="34" width="14" height="12" rx="1.5" fill="${lin('g2', GLASS)}" stroke="#3a4a5a" stroke-width="1"/><rect x="28" y="34" width="14" height="12" rx="1.5" fill="${lin('g3', GLASS)}" stroke="#3a4a5a" stroke-width="1"/>
    <path d="M4 56 H96" stroke="#2a8ae0" stroke-width="4"/><path d="M46 28 V74" stroke="#8d949f" stroke-width="1.2"/><rect x="48" y="52" width="6" height="2" fill="#5a626c"/>
    <path d="M86 52 L95 56 V62 L88 62Z" fill="#fff3a0" stroke="#7a6a00" stroke-width="1"/><rect x="4" y="62" width="4" height="6" fill="#ff4a4a"/>
    <path d="M4 70 H96 V74 H4Z" fill="#3a4048"/>
    ${wheel(24, 76, 11)}${wheel(76, 76, 11)}`),

  heissluftballon: () => art('heissluftballon', BOX, ({ lin }) => `${shadow(50, 96, 14, 2)}
    <path d="M50 3 C16 3 8 34 26 54 L38 66 H62 L74 54 C92 34 84 3 50 3Z" fill="${lin('bl', [[0, '#e6431c'], [.2, '#e6431c'], [.2, '#ffd23f'], [.4, '#ffd23f'], [.4, '#2a8ae0'], [.6, '#2a8ae0'], [.6, '#ffd23f'], [.8, '#ffd23f'], [.8, '#e6431c'], [1, '#e6431c']], 'h')}" stroke="${OUT}" stroke-width="1.6"/>
    <path d="M50 3 C38 16 36 44 40 66 M50 3 C62 16 64 44 60 66 M50 3 C46 24 46 46 46 66 M50 3 C54 24 54 46 54 66" fill="none" stroke="${OUT}" stroke-width=".8" opacity=".55"/>
    <path d="M28 20 Q34 10 44 8" fill="none" stroke="#fff" stroke-width="3" opacity=".4" stroke-linecap="round"/>
    <path d="M38 66 H62 L58 72 H42Z" fill="#6a4a2a"/><path d="M40 72 L42 78 M60 72 L58 78 M50 72 V78" stroke="#4a3018" stroke-width="1"/>
    <path d="M50 66 q-2 3 0 5 q2 -2 0 -5z" fill="#ffb62a"/>
    <rect x="38" y="78" width="24" height="14" rx="2" fill="${lin('bk', ['#c4894a', '#7a4a1c'])}" stroke="#3a2008" stroke-width="1.2"/>
    <path d="M38 83 H62 M38 88 H62 M44 78 V92 M50 78 V92 M56 78 V92" stroke="#4a2c0e" stroke-width=".8" opacity=".6"/>`),

  sportwagen: () => art('sportwagen', BOX, ({ lin }) => `${shadow(50, 89, 46, 3)}
    <path d="M3 66 C3 60 8 58 14 56 L18 48 L22 46 L38 42 C44 34 52 30 60 30 L72 32 C78 34 84 42 90 50 C96 52 98 58 98 64 V72 C98 74 94 76 90 76 H10 C6 76 3 72 3 66Z" fill="${lin('b', ['#ff4a3a', '#a3101a'])}" stroke="#4a0610" stroke-width="1.6"/>
    <path d="M40 42 C46 34 54 32 60 32 L70 34 C74 36 78 42 82 48 L44 48Z" fill="${lin('g', GLASS)}" stroke="#2a3a4a" stroke-width="1.2"/><path d="M62 33 L60 48" stroke="#2a3a4a" stroke-width="1.2"/>
    <path d="M14 56 H20 L22 46" fill="none" stroke="#4a0610" stroke-width="1.2"/><path d="M3 56 L18 50 L14 46 H3Z" fill="#a3101a" stroke="#4a0610" stroke-width="1.2"/>
    <path d="M44 56 H66 L62 62 H44Z" fill="#4a0610" opacity=".6"/><path d="M30 52 Q50 50 78 54" fill="none" stroke="#fff" stroke-width="1.6" opacity=".4"/>
    <path d="M86 52 L96 58 L90 61 L84 56Z" fill="#fffbe0" stroke="#4a0610" stroke-width="1"/><path d="M3 68 H98" stroke="#2a2f36" stroke-width="2"/>
    ${wheel(26, 76, 12, '#e8ebef')}${wheel(76, 76, 12, '#e8ebef')}`),

  luftkissenboot: () => art('luftkissenboot', BOX, ({ lin }) => `${shadow(50, 90, 46, 3)}
    <path d="M4 66 H96 Q100 76 90 80 H10 Q0 76 4 66Z" fill="#2a2f36" stroke="#0a0b0e" stroke-width="1.4"/><path d="M8 72 H92" stroke="#4a525c" stroke-width="1.2"/>
    <path d="M10 66 L22 46 H70 L92 58 V66Z" fill="${lin('h', ['#ffffff', '#c4ccd6'])}" stroke="#5a626c" stroke-width="1.6"/>
    <path d="M34 48 L40 34 H64 L74 50Z" fill="${lin('c', ['#ffd23f', '#e09a00'])}" stroke="#7a5a00" stroke-width="1.4"/><path d="M42 38 H62 L68 48 H38Z" fill="${lin('g', GLASS)}" stroke="#3a4a5a" stroke-width="1"/>
    <path d="M10 62 H92" stroke="#2a8ae0" stroke-width="3"/>
    <path d="M8 34 H24 V60 H8Z" fill="none" stroke="#8a929c" stroke-width="2.4"/><path d="M16 34 V60" stroke="#8a929c" stroke-width="1.6"/><ellipse cx="16" cy="47" rx="3" ry="11" fill="#2a2f36" opacity=".85"/>
    <path d="M16 36 L16 58 M10 42 L22 52 M22 42 L10 52" stroke="#c4ccd6" stroke-width="1.2" opacity=".7"/>
    <path d="M2 82 q6 -6 12 0 t12 0 t12 0 t12 0 t12 0 t12 0 t12 0" fill="none" stroke="#7ad0ff" stroke-width="2.4" opacity=".9"/>`),

  sattelzug: () => art('sattelzug', BOX, ({ lin }) => `${shadow(50, 91, 46, 3)}
    <rect x="2" y="18" width="58" height="50" rx="2" fill="${lin('t', ['#ffffff', '#c4ccd6'])}" stroke="#5a626c" stroke-width="1.6"/>
    <rect x="2" y="42" width="58" height="9" fill="#2a8ae0"/><text x="31" y="35" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="11" fill="#d9232f">DARTS</text>
    <path d="M60 36 H74 L84 48 H92 C96 48 98 52 98 56 V70 H60Z" fill="${lin('cab', ['#ff6a3a', '#a3200c'])}" stroke="#4a1004" stroke-width="1.6"/>
    <path d="M64 38 H73 L81 49 H64Z" fill="${lin('g', GLASS)}" stroke="#2a3a4a" stroke-width="1.2"/><rect x="76" y="22" width="3" height="18" fill="#8a929c"/><rect x="82" y="26" width="3" height="14" fill="#8a929c"/>
    <path d="M90 52 L98 54 V58 H90Z" fill="#fff3a0" stroke="#7a6a00" stroke-width=".8"/><rect x="56" y="64" width="46" height="6" fill="#2a2f36"/>
    ${wheel(14, 78, 10)}${wheel(36, 78, 10)}${wheel(52, 78, 10)}${wheel(84, 78, 10)}`),

  limousine: () => art('limousine', BOX, ({ lin }) => `${shadow(50, 85, 48, 3)}
    <path d="M2 66 V54 C2 50 6 48 10 48 L56 44 C66 42 76 46 82 52 C92 54 98 58 98 64 V72 C98 74 94 76 90 76 H8 C4 76 2 72 2 66Z" fill="${lin('b', ['#3a3f4a', '#0a0b10'])}" stroke="#000" stroke-width="1.6"/>
    <path d="M10 49 L56 45 C64 44 72 46 78 52 H10Z" fill="${lin('g', ['#6a8aa8', '#14202c'])}" stroke="#000" stroke-width="1"/>
    ${[20, 32, 44, 56, 68].map(x => `<line x1="${x}" y1="46" x2="${x}" y2="52" stroke="#000" stroke-width="1.4"/>`).join('')}
    <path d="M4 60 H96" stroke="#cfd5dd" stroke-width="1.6"/><path d="M84 54 L96 58 L90 62 L82 58Z" fill="#fffbe0" stroke="#000" stroke-width="1"/><rect x="2" y="58" width="4" height="6" fill="#d9232f"/>
    <path d="M10 56 Q40 54 80 56" fill="none" stroke="#fff" stroke-width="1.4" opacity=".25"/>
    ${wheel(20, 76, 9, '#e8ebef')}${wheel(80, 76, 9, '#e8ebef')}`),

  hubschrauber: () => art('hubschrauber', BOX, ({ lin }) => `${shadow(50, 92, 34, 2.6)}
    <path d="M6 20 H94" stroke="#2a2f36" stroke-width="2.6" stroke-linecap="round"/><path d="M60 20 V32" stroke="#4a525c" stroke-width="3.4"/>
    <path d="M42 50 L8 40 L8 34 L14 34 L16 44 L42 44Z" fill="${lin('tb', ['#ff6a5a', '#a3101a'])}" stroke="#4a0610" stroke-width="1.4"/>
    <path d="M10 28 V46 M4 38 H16" stroke="#2a2f36" stroke-width="2" opacity=".8"/>
    <ellipse cx="62" cy="52" rx="28" ry="20" fill="${lin('b', ['#ff6a5a', '#a3101a'])}" stroke="#4a0610" stroke-width="1.6"/>
    <path d="M62 36 C76 36 88 46 88 54 H62Z" fill="${lin('g', GLASS)}" stroke="#2a3a4a" stroke-width="1.2"/><path d="M62 36 V54" stroke="#2a3a4a" stroke-width="1.2"/>
    <rect x="38" y="42" width="18" height="12" rx="2" fill="${lin('g2', GLASS)}" stroke="#2a3a4a" stroke-width="1"/>
    <path d="M44 62 H80" stroke="#fff" stroke-width="3" opacity=".8"/>
    <path d="M36 80 H88 M44 70 L42 80 M76 70 L78 80" stroke="#2a2f36" stroke-width="3" stroke-linecap="round"/>
    <circle cx="94" cy="53" r="0"/>`),

  yacht: () => art('yacht', BOX, ({ lin }) => `<path d="M60 6 V22" stroke="#8a929c" stroke-width="1.6"/><circle cx="60" cy="6" r="2" fill="#d9232f"/><path d="M52 14 H68" stroke="#8a929c" stroke-width="1.6"/>
    <path d="M30 26 H66 L72 36 H26Z" fill="${lin('u', ['#ffffff', '#c4ccd6'])}" stroke="#5a626c" stroke-width="1.4"/><path d="M34 29 H64 L67 34 H31Z" fill="${lin('g1', GLASS)}" stroke="#3a4a5a" stroke-width="1"/>
    <path d="M18 36 H78 L84 48 H12Z" fill="${lin('m', ['#ffffff', '#c4ccd6'])}" stroke="#5a626c" stroke-width="1.4"/>
    ${[22, 32, 42, 52, 62, 72].map(x => `<rect x="${x}" y="39" width="6" height="6" rx="1" fill="#3a5a8a" stroke="#2a3a5a" stroke-width=".6"/>`).join('')}
    <path d="M6 48 H94 L84 74 H12Z" fill="${lin('h', ['#ffffff', '#c4ccd6'])}" stroke="#5a626c" stroke-width="1.6"/>
    <path d="M9 56 H92" stroke="#1c3f94" stroke-width="3.4"/><path d="M12 72 H84 L83 76 H13Z" fill="#1c3f94"/>
    ${[18, 30, 42, 54, 66, 78].map(x => `<circle cx="${x}" cy="64" r="2.2" fill="#3a5a8a" stroke="#2a3a5a" stroke-width=".6"/>`).join('')}
    ${water(80, '#7ad0ff', '#1c72c4')}`),

  privatjet: () => art('privatjet', BOX, ({ lin }) => `${shadow(50, 92, 36, 2.6)}
    <path d="M8 40 L18 20 L26 20 L26 38Z" fill="${lin('fn', ['#ffffff', '#c4ccd6'])}" stroke="#5a626c" stroke-width="1.4"/><path d="M12 36 L19 22 L24 22 L24 36Z" fill="#1c3f94"/>
    <path d="M40 54 L62 76 H72 L62 50Z" fill="${lin('w2', ['#c4ccd6', '#7a828c'])}" stroke="#5a626c" stroke-width="1.4"/>
    <path d="M6 44 C6 38 14 34 24 34 L72 36 C86 38 96 46 98 52 C94 58 84 60 72 62 L22 62 C12 62 6 56 6 50Z" fill="${lin('b', ['#ffffff', '#c4ccd6', '#a6aeb8'])}" stroke="#5a626c" stroke-width="1.6"/>
    <path d="M6 52 L92 54" stroke="#1c3f94" stroke-width="3.4"/><path d="M6 56 L90 58" stroke="#d9232f" stroke-width="1.6"/>
    ${[26, 34, 42, 50, 58, 66].map(x => `<rect x="${x}" y="42" width="4.6" height="5.4" rx="2" fill="#2a4a78" stroke="#1a2a48" stroke-width=".6"/>`).join('')}
    <path d="M78 40 L92 48 L84 48Z" fill="${lin('ws', GLASS)}" stroke="#2a3a4a" stroke-width="1"/>
    <rect x="14" y="40" width="14" height="9" rx="4" fill="${lin('en', ['#e8ebef', '#7a828c'])}" stroke="#4a525c" stroke-width="1.2" transform="translate(0 2)"/>
    <path d="M30 62 L54 82 H64 L56 62Z" fill="${lin('w1', ['#e8ebef', '#8d949f'])}" stroke="#5a626c" stroke-width="1.4"/>`),

  panzer: () => art('panzer', BOX, ({ lin }) => `${shadow(50, 90, 46, 3)}
    <path d="M6 64 Q6 82 22 82 H78 Q94 82 94 64 V60 H6Z" fill="#2a2f28" stroke="#0a0c08" stroke-width="1.6"/>
    ${[18, 30, 42, 54, 66, 78].map(x => `<circle cx="${x}" cy="72" r="7.6" fill="${lin('w' + x, ['#5a6450', '#262a22'])}" stroke="#0a0c08" stroke-width="1.2"/><circle cx="${x}" cy="72" r="2.4" fill="#8a9480"/>`).join('')}
    <path d="M10 64 L18 48 H82 L92 62Z" fill="${lin('h', ['#7a8a4a', '#3a4a1e'])}" stroke="#1a2208" stroke-width="1.6"/>
    <path d="M30 48 L36 32 H66 L72 48Z" fill="${lin('t', ['#8a9a56', '#44541e'])}" stroke="#1a2208" stroke-width="1.6"/>
    <rect x="70" y="36" width="28" height="5.6" rx="2.4" fill="${lin('bar', ['#6a7a3a', '#2a3a12'])}" stroke="#1a2208" stroke-width="1.2"/><rect x="94" y="34.4" width="5" height="9" rx="1.6" fill="#2a3a12" stroke="#1a2208" stroke-width="1"/>
    <ellipse cx="46" cy="32" rx="8" ry="3" fill="#2a3a12" stroke="#1a2208" stroke-width="1"/><path d="M46 29 V22 M42 22 H50" stroke="#1a2208" stroke-width="1.8"/>
    <path d="M14 56 q6 -4 12 0 q-4 5 -12 0Z M56 54 q8 -4 14 0 q-5 5 -14 0Z M38 42 q6 -3 10 0 q-4 4 -10 0Z" fill="#4a5a24" opacity=".8"/>
    <path d="M6 62 H94" stroke="#fff" stroke-width="1" opacity=".18"/>`),

  rennwagen: () => art('rennwagen', BOX, ({ lin }) => `${shadow(50, 90, 46, 3)}
    <rect x="3" y="26" width="18" height="5" rx="1.4" fill="#fff" stroke="${OUT}" stroke-width="1.2"/><rect x="3" y="25" width="18" height="2.6" fill="#d9232f"/><path d="M12 31 V56" stroke="${OUT}" stroke-width="2.4"/>
    <path d="M12 60 L14 52 L38 50 L48 42 H62 L66 46 L92 56 L96 62 L92 66 H8Z" fill="${lin('b', ['#ff4a3a', '#a3101a'])}" stroke="#4a0610" stroke-width="1.6"/>
    <path d="M30 56 H64 L58 62 H32Z" fill="#fff" opacity=".9"/><text x="48" y="61" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="7" fill="#d9232f">1</text>
    <path d="M44 50 C44 42 50 38 56 40 L58 48Z" fill="#14161a" stroke="#000" stroke-width="1"/><circle cx="52" cy="40" r="6" fill="${lin('hm', ['#ffffff', '#ffd23f'])}" stroke="${OUT}" stroke-width="1.2"/><path d="M52 36 H59 L58 41 H52Z" fill="#1d4a8a"/>
    <path d="M84 62 H98 V68 H84Z" fill="#14161a" stroke="#000" stroke-width="1"/><path d="M94 58 H99" stroke="#d9232f" stroke-width="2.4"/>
    ${wheel(26, 70, 15, '#e8ebef')}${wheel(78, 72, 11, '#e8ebef')}`),

  duesenjaeger: () => art('duesenjaeger', BOX, ({ lin, rad }) => `${shadow(50, 92, 36, 2.6)}
    <path d="M4 50 L-4 46 L4 42Z" fill="#ff8a1f" opacity="0"/><ellipse cx="6" cy="50" rx="8" ry="4.4" fill="${rad('af', ['#ffffff', '#ffb62a', 'rgba(255,90,20,0)'])}"/>
    <path d="M18 34 L8 14 H20 L34 38Z" fill="${lin('fn', ['#9aa4b0', '#4a525c'])}" stroke="${OUT}" stroke-width="1.4"/>
    <path d="M34 60 L22 82 H40 L58 62Z" fill="${lin('w2', ['#8a94a0', '#3a424c'])}" stroke="${OUT}" stroke-width="1.4"/>
    <path d="M8 46 C8 40 16 38 26 38 H64 C78 38 92 46 98 52 C90 58 78 60 64 60 H26 C14 60 8 54 8 50Z" fill="${lin('b', ['#c4ccd6', '#7a8490', '#4a525c'])}" stroke="${OUT}" stroke-width="1.6"/>
    <path d="M50 40 C56 30 70 32 76 42Z" fill="${lin('c', ['#bfe6ff', '#2a5a8a'])}" stroke="${OUT}" stroke-width="1.2"/>
    <path d="M22 40 L50 20 L64 40Z" fill="${lin('w1', ['#aab4c0', '#5a626c'])}" stroke="${OUT}" stroke-width="1.4"/>
    <path d="M30 52 H62" stroke="#fff" stroke-width="1.2" opacity=".5"/><circle cx="46" cy="50" r="3.4" fill="#d9232f" stroke="#fff" stroke-width="1"/><circle cx="46" cy="50" r="1.4" fill="#1c3f94"/>
    <path d="M92 52 L99 53" stroke="#2a2f36" stroke-width="2"/>`),
};
