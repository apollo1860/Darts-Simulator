// K.-o.-Baum (DOM-frei): Setzliste, Freilose, Rundennamen, Platzierungen
export const ROUND_NAME = { 2: 'Finale', 4: 'Halbfinale', 8: 'Viertelfinale', 16: 'Achtelfinale', 32: 'Letzte 32', 64: 'Letzte 64', 128: 'Letzte 128', 256: 'Letzte 256' };
export const PLACE_BY_REMAINING = { 2: 'F', 4: 'SF', 8: 'QF', 16: 'L16', 32: 'L32', 64: 'L64', 128: 'L128', 256: 'L256' };
const nextPow2 = n => { let s = 2; while (s < n) s *= 2; return s; };

// Setzpositionen (1-basiert) für Feldgröße size: 1 vs size, 2 vs size-1 … verteilt
function seedOrder(size) {
  let order = [1, 2];
  while (order.length < size) {
    const n = order.length * 2;
    order = order.flatMap(s => [s, n + 1 - s]);
  }
  return order;
}

// fmt: {stopAt, default:{legs}, byRemaining:{n:{...}}} ; seeded = IDs nach Setzliste (Bester zuerst)
export function buildRounds(seeded, fmt) {
  const size = nextPow2(Math.max(seeded.length, (fmt.stopAt ?? 1) * 2));
  const order = seedOrder(size);
  const slot = order.map(s => seeded[s - 1] ?? null);       // null = Freilos
  const first = [];
  for (let i = 0; i < size; i += 2) {
    const a = slot[i], b = slot[i + 1];
    if (a && b) first.push({ a, b, winner: null, score: null });
    else first.push({ a: a ?? b, b: null, winner: a ?? b, bye: true });
  }
  const rounds = [];
  for (let rem = size; rem > (fmt.stopAt ?? 1); rem /= 2) {
    rounds.push({ name: ROUND_NAME[rem] ?? `Letzte ${rem}`, remaining: rem, format: fmt.byRemaining?.[rem] ?? fmt.default, matches: [] });
  }
  rounds[0].matches = first;
  return rounds;
}

// Gewinner der Runde paarweise in die nächste Runde
export function pairWinners(round) {
  const w = round.matches.map(m => m.winner);
  const next = [];
  for (let i = 0; i < w.length; i += 2) {
    const a = w[i], b = w[i + 1];
    if (a && b) next.push({ a, b, winner: null, score: null });
    else next.push({ a: a ?? b, b: null, winner: a ?? b, bye: true });
  }
  return next;
}

// Platzierung eines Spielers (null = noch im Turnier/Überlebender)
export function placeOf(rounds, id) {
  for (const r of rounds) {
    const m = r.matches.find(x => (x.a === id || x.b === id) && x.winner && !x.bye);
    if (m && m.winner !== id) return PLACE_BY_REMAINING[r.remaining];
  }
  return null;
}
