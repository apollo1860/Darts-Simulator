// Einsteckwinkel: Seitenansicht und Wirkungstext (Profil-Erstellung, Training → Winkel; Version 206 ausgelagert)
import { severity, stability } from '../../obstruction.js';

// Seitenansicht: Board links, Dart steckt im roten Feld; positiver Winkel = hinteres Ende (Flight) oben
export const dartSvg = a => `<svg class="nsd-angle-svg" viewBox="0 -70 260 302" aria-hidden="true">
  <rect x="38" y="8" width="12" height="134" rx="3" fill="#aab5c6"/><rect x="38" y="68" width="12" height="26" fill="#c9444f"/>
  <line x1="56" y1="81" x2="236" y2="81" stroke="#8d9bb3" stroke-width="1.5" stroke-dasharray="6 6"/>
  <g transform="translate(50 81) rotate(${-a})"><line x1="0" y1="0" x2="118" y2="0" stroke="#dfe6ef" stroke-width="4" stroke-linecap="round"/>
    <rect x="28" y="-6" width="52" height="12" rx="6" fill="#b99f5e"/><polygon points="116,0 142,-18 164,-16 168,4 146,18" fill="#6fb59a" stroke="#fff" stroke-width="1.5"/></g></svg>`;
export const effectText = a => {
  const sev = severity(a), shadow = sev < 0.2 ? 'kaum' : sev < 0.5 ? 'wenig' : sev < 0.8 ? 'deutlich' : 'stark';
  const flight = stability(a) > 1.0001 * stability(10) ? 'unruhigerer Flug' : 'ruhiger Flug';
  return `Abpraller-Zone hinter steckenden Darts: <b>${shadow}</b> · ${flight}`;
};
// Erklärung der Abpraller-Mechanik (Version 205)
export const ANGLE_INFO = 'Steckende Darts verdecken mit Barrel und Flight das Feld hinter ihrer Spitze – je steiler (nach oben oder unten), desto länger. Darts, die dort landen, prallen ab und rutschen knapp hinter die Spitze. <b>Flight oben</b> („anwerfen“): steckt der Dart knapp über T20, rutschen zu hohe Darts ins Triple – steckt er darunter, verdeckt er das Triple. <b>Flight unten</b> („drauflegen“): steckt der Dart knapp unter T20, rutschen zu tiefe Darts ins Triple – steckt er darüber, verdeckt er es. Beide Stile sind gleich stark; ganz extreme Winkel (über 45°) fliegen etwas unruhiger.';
