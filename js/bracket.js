// K.-o.-Baum (DOM-frei): Setzliste, Freilose, Rundennamen, Platzierungen
export const ROUND_NAME = { 2: 'Finale', 4: 'Halbfinale', 8: 'Viertelfinale', 16: 'Achtelfinale', 32: 'Letzte 32', 64: 'Letzte 64', 128: 'Letzte 128', 256: 'Letzte 256' };
export const PLACE_BY_REMAINING = { 2: 'F', 4: 'SF', 8: 'QF', 16: 'L16', 32: 'L32', 64: 'L64', 96: 'L96', 128: 'L128', 160: 'L160', 256: 'L256' };
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
  let size, slot;
  if (fmt.sections) {                                        // n Sektionen ohne Setzliste (z. B. TCHQ: 10 Sieger)
    const per = nextPow2(Math.max(2, Math.ceil(seeded.length / fmt.sections)));
    size = per * fmt.sections;
    slot = Array(size).fill(null);                           // erst je Paarung ein Spieler, dann die zweiten → keine leeren Paarungen
    seeded.forEach((id, i) => { slot[i < size / 2 ? i * 2 : (i - size / 2) * 2 + 1] = id; });
  } else {
    size = nextPow2(Math.max(seeded.length, (fmt.stopAt ?? 1) * 2));
    slot = seedOrder(size).map(s => seeded[s - 1] ?? null);  // null = Freilos
  }
  const first = [];
  for (let i = 0; i < size; i += 2) {
    const a = slot[i], b = slot[i + 1];
    if (a && b) first.push({ a, b, winner: null, score: null });
    else first.push({ a: a ?? b, b: null, winner: a ?? b, bye: true });
  }
  const rounds = [];
  for (let rem = size; rem > (fmt.stopAt ?? 1); rem /= 2) {
    rounds.push({ name: fmt.sections ? (rem / 2 === fmt.stopAt ? 'Entscheidungsspiel' : `Runde ${rounds.length + 1}`) : fmt.seeds && !rounds.length && seeded.length < rem && seeded.length > rem / 2 ? `Letzte ${seeded.length}` : ROUND_NAME[rem] ?? `Letzte ${rem}`, remaining: rem, format: fmt.byRemaining?.[rem] ?? fmt.default, matches: [] });
  }
  rounds[0].matches = first;
  return rounds;
}

// ---- UK Open („FA Cup des Darts“): gestaffelter Einstieg, ab Runde 4 freie Auslosung nach jeder Runde ----
// field = Holder nach Rangliste (max. 128), dann Nicht-Holder. Runde 1: ab Platz 97 + Nicht-Holder, Runde 2: 65–96,
// Runde 3: 33–64, Runde 4 (Letzte 64): Top 32.
const pairUp = list => {
  const out = [];
  for (let i = 0; i < list.length; i += 2) out.push(list[i + 1] ? { a: list[i], b: list[i + 1], winner: null, score: null } : { a: list[i], b: null, winner: list[i], bye: true });
  return out;
};
export function buildUkOpenRounds(field, fmt, rng) {
  const entry = { 1: field.slice(64, 96), 2: field.slice(32, 64), 3: field.slice(0, 32) };
  const rounds = [['Runde 1', 160], ['Runde 2', 128], ['Runde 3', 96], ...[64, 32, 16, 8, 4, 2].map(r => [ROUND_NAME[r], r])]
    .map(([name, rem]) => ({ name, remaining: rem, format: fmt.byRemaining?.[rem] ?? fmt.default, matches: [] }));
  rounds[0].matches = pairUp(rng.shuffle(field.slice(96)));
  return { rounds, entry };
}
// Nächste Runde: Neueinsteiger gegen Sieger der Vorrunde (Runde 2/3), ab Runde 4 jeder gegen jeden (offene Auslosung)
export function ukOpenMatches(prev, entrants, rng, open) {
  const w = rng.shuffle(prev.matches.map(m => m.winner).filter(Boolean));
  if (open) return pairUp(rng.shuffle([...w, ...entrants]));
  const e = rng.shuffle(entrants), out = [];
  while (e.length && w.length) out.push({ a: e.pop(), b: w.pop(), winner: null, score: null });
  return [...out, ...pairUp([...e, ...w])];
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
    if (m && m.winner !== id) return r.place ?? PLACE_BY_REMAINING[r.remaining];
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
    rounds.push({ name: fmt.sections ? (rem / 2 === fmt.stopAt ? 'Entscheidungsspiel' : `Runde ${rounds.length + 1}`) : ROUND_NAME[rem] ?? `Letzte ${rem}`, remaining: rem, format: fmt.byRemaining?.[rem] ?? fmt.default, matches: [] });
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
export function groupPlace(rounds, groups, id, adv = 2) {
  const gi = groups.findIndex(g => g.includes(id));
  if (gi < 0) return null;
  const pos = groupTable(rounds, groups[gi], gi).findIndex(x => x.id === id);
  return pos >= adv ? `G${pos + 1}` : null;
}

// ---- Vorrunde Winmau World Masters: Gruppen (2–4 Spieler, jeder gegen jeden), nur Gruppensieger → K.-o. gegen Gesetzte ----
export function buildPrelimRounds(groups, fmt, koSize = 64, label = 'Vorrunde · Gruppenspiel') {
  const pairs = g => g.flatMap((_, x) => g.slice(x + 1).map((__, k) => [x, x + 1 + k]));
  const days = [];
  groups.forEach((g, gi) => {
    const busy = [];                                           // Spieltag: jeder höchstens ein Match
    for (const [x, y] of pairs(g)) {
      let d = 0;
      while (busy[d]?.has(x) || busy[d]?.has(y)) d++;
      (busy[d] ??= new Set()).add(x).add(y);
      (days[d] ??= []).push({ a: g[x], b: g[y], winner: null, score: null, group: gi });
    }
  });
  const rounds = days.map((matches, d) => ({ name: `${label} ${d + 1}`, remaining: groups.length, isGroup: true, format: fmt.group, matches }));
  for (let rem = koSize; rem > (fmt.stopAt ?? 1); rem /= 2) {
    rounds.push({ name: ROUND_NAME[rem] ?? `Letzte ${rem}`, remaining: rem, format: fmt.byRemaining?.[rem] ?? fmt.default, matches: [] });
  }
  return rounds;
}
// K.-o.-Runde: Gesetzte (Platz 25–56) gegen zugeloste Gruppensieger; fehlende Gegner = Freilos
export function prelimKoMatches(rounds, groups, seeds, rng) {
  const winners = rng.shuffle(groups.map((g, gi) => groupTable(rounds, g, gi)[0]?.id).filter(Boolean));
  const n = Math.max(seeds.length, winners.length), out = [];
  for (let i = 0; i < n; i++) {
    const a = seeds[i] ?? winners.pop(), b = seeds[i] ? winners.pop() : winners.pop();
    if (a && b) out.push({ a, b, winner: null, score: null });
    else if (a || b) out.push({ a: a ?? b, b: null, winner: a ?? b, bye: true });
  }
  return out;
}
