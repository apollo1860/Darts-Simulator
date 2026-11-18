// Version 170 (Nutzerwunsch): Emojis werden in der ganzen App durch eigene Icons (icons.js) ersetzt – Flaggen bleiben Emojis.
// Ein MutationObserver tauscht in allen Textknoten bekannte Emojis gegen <span class="nsd-emo">SVG</span>; Auswahllisten, Eingabefelder,
// Titel/Skripte und SVG-Texte bleiben unberührt. Unbekannte Emojis bleiben stehen (Fallback). Neue Zuordnungen hier ergänzen.
import { icon } from './icons.js';
import { lifeArt } from './art/index.js';
import { LIFESTYLE } from '../../../data/lifestyle.js';

export const EMOJI = {
  '🎯': 'skill', '🎤': 'mic', '🎙️': 'mic', '💎': 'diamond', '⚠️': 'warning', '⚠': 'warning', '🏆': 'ranks', '🤝': 'sponsors', '🔥': 'flame',
  '⭐': 'star', '🌟': 'star', '✨': 'star', '★': 'star', '✅': 'check', '✔️': 'check', '✔': 'check', '✓': 'check', '❌': 'cross', '✖': 'cross', '🚫': 'cross',
  '📈': 'chartUp', '⬆️': 'chartUp', '⬆': 'chartUp', '📉': 'chartDown', '📊': 'stats', '📋': 'stats', '🧮': 'stats', '🏁': 'flag', '🎟️': 'ticket', '🎫': 'ticket',
  '⚔️': 'swords', '🗡️': 'swords', '🏹': 'swords', '🔧': 'wrench', '🛠️': 'wrench', '🔩': 'wrench', '🔨': 'wrench', '💼': 'team',
  '💪': 'fitness', '🏋️': 'fitness', '🏃': 'fitness', '👟': 'fitness', '🧘': 'fitness', '🚴': 'fitness', '💆': 'fitness',
  '💍': 'ring', '🥶': 'cold', '🧊': 'cold', '⚡': 'bolt', '🪶': 'darts', '🎲': 'dice', '🎰': 'dice',
  '😰': 'faceNervous', '😬': 'faceNervous', '😵': 'faceNervous', '🥴': 'faceNervous', '😷': 'faceSad', '🤧': 'faceSad',
  '😊': 'faceHappy', '🙂': 'faceHappy', '😄': 'faceHappy', '😌': 'faceHappy', '😏': 'faceHappy', '👋': 'faceHappy', '😐': 'faceNeutral', '😠': 'faceAngry', '😤': 'faceAngry',
  '🗓️': 'calendar', '🧣': 'fans', '🎉': 'party', '🥳': 'party', '🎆': 'party', '🎈': 'party', '🪩': 'party', '🎂': 'party',
  '🏅': 'medal', '🥇': 'medal', '🥈': 'medalS', '🥉': 'medalB', '👑': 'crown',
  '❤️': 'heart', '❤': 'heart', '🧡': 'heart', '💛': 'heart', '💞': 'heart', '💘': 'heart', '💋': 'heart', '🌹': 'heart', '💔': 'heartBroken',
  '🍺': 'pint', '🍻': 'pint', '🥤': 'pint', '🥃': 'shot', '🍸': 'cocktail', '🥂': 'cocktail',
  '📺': 'tv', '📻': 'tv', '🎬': 'tv', '🖥️': 'laptop', '💻': 'laptop', '🚗': 'car', '🏎️': 'car', '🚘': 'car', '🏠': 'home', '🏡': 'home',
  '🔍': 'magnifier', '💥': 'burst', '💣': 'burst', '🛌': 'bed', '🛏️': 'bed', '📱': 'phone', '📸': 'phone', '📷': 'phone', '🌐': 'globe', '🌍': 'globe',
  '📣': 'megaphone', '🔊': 'megaphone', '🦴': 'injury', '🤕': 'injury', '🦷': 'injury', '🩹': 'injury', '💊': 'injury', '👕': 'shirt', '🐟': 'fish',
  '⏩': 'ff', '⏭': 'skip', '⏸': 'pause', '📰': 'news', '🗞️': 'news', '💯': 'hundred', '🧹': 'broom', '🏰': 'ranks', '🌊': 'ranks',
  '🕴️': 'person', '🤵': 'person', '🧔': 'person', '👩‍💼': 'person', '👪': 'life', '👥': 'life',
  '🛩️': 'plane', '✈️': 'plane', '🚁': 'plane', '💰': 'money', '🎮': 'gamepad', '🕹️': 'gamepad', '🧠': 'bulb', '💡': 'bulb',
  '💬': 'chat', '💭': 'chat', '📬': 'letter', '📝': 'letter', '⚖️': 'scale', '➕': 'plus', '⏳': 'hourglass', '🛒': 'shop', '🛡️': 'card',
  // Version 173: restliche Emojis (Sponsoren-Branchen, Spielmomente, Einzelfälle, Pfeile)
  '🏨': 'hotel', '🏦': 'bank', '🎧': 'headphones', '🔌': 'plug', '🥐': 'croissant', '🍔': 'burger', '🍬': 'candy', '🛋️': 'sofa', '🎹': 'piano',
  '💦': 'sweat', '🎶': 'notes', '🎵': 'notes', '📌': 'pin', '🥛': 'milk', '👎': 'thumbDown', '🆘': 'sos', '🍝': 'pasta', '🧯': 'extinguisher', '🥗': 'salad',
  '◀️': 'triL', '▶️': 'triR', '🙌': 'fans',
  '🐂': 'skill', '🧬': 'fitness', '🏝️': 'globe', '🏖️': 'globe', '🌆': 'home', '🏙️': 'home', '🏢': 'home', '📦': 'shop', '🔑': 'home', '👞': 'shirt', '👗': 'shirt',
};
// Lifestyle-Emojis ohne eigenes Icon (z. B. 🛴 ⛵ ⌚) → kleine Fassung der Shop-Grafik
for (const it of LIFESTYLE) if (it.icon && !EMOJI[it.icon] && !EMOJI[it.icon.replace('\uFE0F', '')]) EMOJI[it.icon] = `ls:${it.id}`;
const ico = n => n?.startsWith('ls:') ? lifeArt(n.slice(3)).replace(/class="nsd-art[^"]*"/, m => `class="nsd-ico nsd-ico-art${/viewBox="0 0 160/.test(lifeArt(n.slice(3))) ? ' wide' : ''}"`) : icon(n);
const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
for (const k of Object.keys(EMOJI)) if (k.endsWith('\uFE0F')) EMOJI[k.slice(0, -1)] ??= EMOJI[k];   // auch ohne Variantenzeichen
const KEYS = Object.keys(EMOJI).sort((a, b) => b.length - a.length);
const RE = new RegExp(`(${KEYS.map(esc).join('|')})️?`, 'gu');
const SKIP = new Set(['OPTION', 'SELECT', 'TEXTAREA', 'INPUT', 'TITLE', 'SCRIPT', 'STYLE', 'text', 'tspan']);
const skip = el => { for (let e = el; e && e !== document.body; e = e.parentNode) if (SKIP.has(e.nodeName) || e.classList?.contains('nsd-noemo') || e.nodeName === 'svg') return true; return false; };
// Text mit Emojis → HTML mit Icons (für Stellen außerhalb des DOM, z. B. Tests)
export const emojiHtml = s => s.replace(RE, (_, e) => `<span class="nsd-emo">${ico(EMOJI[e] ?? EMOJI[e.replace('️', '')])}</span>`);
function swapText(node) {
  const t = node.nodeValue;
  if (!t || !RE.test(t)) return; RE.lastIndex = 0;
  if (skip(node.parentNode)) return;
  const span = document.createElement('span'); span.innerHTML = emojiHtml(t.replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])));
  const frag = document.createDocumentFragment(); while (span.firstChild) frag.appendChild(span.firstChild);
  node.parentNode.replaceChild(frag, node);
}
export function emojify(root) {
  if (root.nodeType === 3) return swapText(root);
  if (root.nodeType !== 1 || skip(root)) return;
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), list = [];
  while (w.nextNode()) list.push(w.currentNode);
  list.forEach(swapText);
}
export function installEmojiSwap() {
  emojify(document.body);
  new MutationObserver(muts => { for (const m of muts) { if (m.type === 'characterData') swapText(m.target); else m.addedNodes.forEach(emojify); } })
    .observe(document.body, { childList: true, subtree: true, characterData: true });
}
