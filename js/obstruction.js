// Einsteckwinkel der Darts und „verbaute“ Felder (DOM-frei).
// Winkel in Grad zur Waagerechten (Seitenansicht): 0° = Dart steckt waagerecht, + = hinteres Ende (Flight) oben, − = unten.
// Ein steckender Dart verdeckt mit Barrel und Flight den Bereich in Richtung seines hinteren Endes: Bei positivem Winkel liegt der
// Flight über der Spitze (je schräger, desto länger der „Schatten“ nach oben), bei negativem unter der Spitze (kurzer Schatten, weil
// der nächste Dart von oben kommt – „draufzulegen“ ist dann leichter). Wer ein verbautes Feld stur weiter anspielt, streut mehr,
// die Darts prallen ab und in einem kleinen Teil der Fälle gibt es einen Bouncer. Nur Darts derselben Aufnahme stecken gleichzeitig im Board.
export const ANGLE_MIN = -30, ANGLE_MAX = 60, ANGLE_DEFAULT = 15;
export const ANGLE_AI_MEAN = 18, ANGLE_AI_SD = 14;      // KI-Spieler: je Person fester Winkel um diesen Mittelwert

const DART_LEN = 110;     // mm: sichtbare Länge eines steckenden Darts (Spitze bis Flight)
const FLIGHT_W = 20;      // mm: Breite des verdeckten Streifens
const BODY = 12;          // mm: Mindestlänge (Barrel selbst), auch bei 0°
const DOWN = 0.35;        // negative Winkel: Schatten nur 35 % so lang
const SOFT = 7;           // mm: weiche Kante des Schattens
export const BLOCK_SIGMA = 0.25;   // Streuung × (1 + BLOCK_SIGMA · verbaut)
export const BOUNCE_P = 0.05;     // Bouncer-Chance bei vollständig verbautem Feld (× verbaut)
export const SWITCH_AT = 0.7;     // ab hier wechselt die KI das Feld

export const clampAngle = a => Math.max(ANGLE_MIN, Math.min(ANGLE_MAX, a));
// Flug-Stabilität: sehr flache bzw. nach unten steckende Darts (< 10°) fliegen unruhiger (Streuung +0,2 % je Grad darunter)
export const SIGMA_COMP = 0.925;  // Ausgleich (nur Scoring-Darts), damit KI-Spieler mit dem mittleren Winkel ihren kalibrierten Average behalten
export const stability = (angle, dbl = false) => (dbl ? 1 : SIGMA_COMP) * (1 + 0.002 * Math.max(0, 10 - angle));
// Wie stark wirkt ein Schatten? 0° = 25 %, 45°+ = 100 %; nach unten (− bis −30°) bis auf 0 %
export const severity = angle => (angle >= 0 ? 0.25 + 0.75 * Math.min(1, angle / 45) : Math.max(0, 0.25 * (1 + angle / 30)));

// Verdeckter Streifen eines Darts mit Spitze `tip` (mm, y nach unten)
export function shadowRect(tip, angle) {
  const rad = Math.abs(angle) * Math.PI / 180, up = angle >= 0;
  const len = Math.max(BODY, DART_LEN * Math.sin(rad) * (up ? 1 : DOWN));
  return { x0: tip.x - FLIGHT_W / 2, x1: tip.x + FLIGHT_W / 2, y0: up ? tip.y - len : tip.y - 6, y1: up ? tip.y + 6 : tip.y + len };
}
// Wie stark ist der Zielpunkt verbaut? 0 = frei … 1 = mitten im Schatten eines steckenden Darts
export function blockage(point, tips, angle) {
  let s = 0;
  for (const t of tips ?? []) {
    const r = shadowRect(t, angle);
    const dx = Math.max(r.x0 - point.x, 0, point.x - r.x1), dy = Math.max(r.y0 - point.y, 0, point.y - r.y1);
    s = Math.max(s, 1 - Math.min(1, Math.hypot(dx, dy) / SOFT));
  }
  return s * severity(angle);
}

// Erwarteter Average-Faktor eines Winkels gegenüber dem KI-Mittel (Messung mit KI-Spielern, die verbaute Felder meiden) – für die
// Schnellsimulation ohne Darts: ≈ 0° bis 18° neutral, nach oben stärker verbaut (bis −3 %), nach unten unruhigerer Flug (−0,5 %)
const EFF = [[-30, 0.995], [-15, 0.998], [0, 1], [10, 1.002], [18, 1], [30, 0.987], [45, 0.974], [60, 0.974]];
export function angleEfficiency(angle) {
  if (angle <= EFF[0][0]) return EFF[0][1];
  for (let i = 1; i < EFF.length; i++) if (angle <= EFF[i][0]) { const [x0, y0] = EFF[i - 1], [x1, y1] = EFF[i]; return y0 + (y1 - y0) * (angle - x0) / (x1 - x0); }
  return EFF[EFF.length - 1][1];
}

// Winkel eines KI-Spielers: je Person fest (aus der ID), normalverteilt um ANGLE_AI_MEAN
export function aiAngle(id) {
  let h = 2166136261;
  for (const c of `winkel|${id}`) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  const u = k => { h = Math.imul(h ^ (h >>> 15), 2246822507 + k); h ^= h >>> 13; return ((h >>> 0) % 100000 + 0.5) / 100000; };
  const z = Math.sqrt(-2 * Math.log(u(1))) * Math.cos(2 * Math.PI * u(2));
  return Math.round(clampAngle(ANGLE_AI_MEAN + ANGLE_AI_SD * z));
}
// Winkel eines Spielers: eigener Wert (Profil) bzw. fester KI-Wert
export const angleOf = (state, id) => (id === 'P' ? (state.player.angle ?? ANGLE_DEFAULT) : aiAngle(id));

// Bouncer: Dart prallt ab, zählt nicht (steckt nicht)
// Version 135: Bouncer-Chance eines Darts = Grundchance des Dart-Modells + BOUNCE_P × verbaut × Faktor (ohne Dart-Angabe wie bisher)
export const bounceChance = (block, b) => (b?.base ?? 0) + (block > 0 ? BOUNCE_P * block * (b?.mult ?? 1) : 0);
// Version 136: Robin Hood – Dart landet (fast) genau auf einem steckenden Dart derselben Aufnahme und bleibt in dessen Flight stecken (0 Punkte).
// Nur bei Abstand < ROBIN_R mm zur Spitze, dann ROBIN_P × Flight-Faktor: Standard-Flight 1, je teurer desto niedriger (flightRobin), KI-Profis ROBIN_AI.
export const ROBIN_R = 3, ROBIN_P = 0.03, ROBIN_AI = 0.25;
export const flightRobin = price => 1 / (1 + (price ?? 0) / 20);
export const robinChance = (pt, tips, mult = ROBIN_AI) => (tips?.some(t => Math.hypot(t.x - pt.x, t.y - pt.y) < ROBIN_R) ? ROBIN_P * mult : 0);
export const ROBIN = { label: 'ROBIN', score: 0, mult: 0, num: 0, double: false };
export const BOUNCER = { label: 'BOUNCER', score: 0, mult: 0, num: 0, double: false };
