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
    if (r.isGroup) continue;                         // Gruppenspiele → groupPlace()
    const m = r.matches.find(x => (x.a === id || x.b === id) && x.winner && !x.bye);
    if (m && m.winner !== id) return PLACE_BY_REMAINING[r.remaining];
  }
  return null;
}

// ---- Gruppenphase (Grand Slam): Gruppen à 4, jeder gegen jeden, Top 2 → K.-o. ----
const GROUP_DAYS = [[[0, 1], [2, 3]], [[0, 2], [1, 3]], [[0, 3], [1, 2]]];
export const GROUP_NAMES = 'ABCDEFGH';

export function buildGroupRounds(groups, fmt) {
  const rounds = GROUP_DAYS.map((day, d) => ({
    name: `Gruppenphase · Spieltag ${d + 1}`, remaining: groups.length * 4, isGroup: true, format: fmt.group,
    matches: groups.flatMap((g, gi) => day.map(([x, y]) => ({ a: g[x], b: g[y], winner: null, score: null, group: gi }))),
  }));
  for (let rem = groups.length * 2; rem > 1; rem /= 2) {
    rounds.push({ name: ROUND_NAME[rem] ?? `Letzte ${rem}`, remaining: rem, format: fmt.byRemaining?.[rem] ?? fmt.default, matches: [] });
  }
  return rounds;
}

// Tabelle einer Gruppe: Siege (2 Punkte), dann Leg-Differenz, dann Legs
export function groupTable(rounds, group, gi) {
  const t = Object.fromEntries(group.map(id => [id, { id, p: 0, w: 0, l: 0, lf: 0, la: 0 }]));
  for (const r of rounds.filter(x => x.isGroup)) {
    for (const m of r.matches.filter(x => x.group === gi && x.winner)) {
      const a = t[m.a], b = t[m.b];
      a.lf += m.score[0]; a.la += m.score[1]; b.lf += m.score[1]; b.la += m.score[0];
      const w = m.winner === m.a ? a : b, lo = w === a ? b : a;
      w.p += 2; w.w++; lo.l++;
    }
  }
  return Object.values(t).sort((x, y) => y.p - x.p || (y.lf - y.la) - (x.lf - x.la) || y.lf - x.lf);
}

// Achtelfinale: Gruppensieger gegen Zweite der Nachbargruppe (A1–B2, B1–A2, C1–D2 …)
export function groupKoMatches(rounds, groups) {
  const tabs = groups.map((g, gi) => groupTable(rounds, g, gi));
  const out = [];
  for (let gi = 0; gi < groups.length; gi += 2) {
    out.push({ a: tabs[gi][0].id, b: tabs[gi + 1][1].id, winner: null, score: null });
    out.push({ a: tabs[gi + 1][0].id, b: tabs[gi][1].id, winner: null, score: null });
  }
  return out;
}

// Platzierung Gruppen-Aus (G3/G4)
export function groupPlace(rounds, groups, id) {
  const gi = groups.findIndex(g => g.includes(id));
  if (gi < 0) return null;
  const pos = groupTable(rounds, groups[gi], gi).findIndex(x => x.id === id);
  return pos >= 2 ? `G${pos + 1}` : null;
}
