// Aufruf: node tests/calibCtrl.mjs [Läufe=300] [Status=30] [Manager=m3] ['{"rate":0.15,"kinds":[…],"params":{…}}']
// Kalibrierung umstrittene Sponsoren: wie oft lohnt sich ein Vertrag finanziell (★ über Laufzeit + 26 Wochen, gegenüber „kein Vertrag“)?
import * as N from '../js/nsd.js';
import * as C from '../js/career.js';
import * as X from '../data/controversial.js';
import * as R from '../data/sponsorsreal.js';
import { RNG } from '../js/rng.js';

if (process.argv[5]) { const o = JSON.parse(process.argv[5]); if (o.kinds) X.CONTROVERSY_KINDS.forEach((k, i) => { k.w = o.kinds[i]; }); for (const [k, v] of Object.entries(o.params ?? {})) Object.assign(X.CONTROVERSY_PARAMS[k] ?? (X.CONTROVERSY_PARAMS[k] = {}), v); if (o.rate != null) X.CONTROVERSY_PARAMS.rate = o.rate; }
const runs = +(process.argv[2] ?? 300), level = +(process.argv[3] ?? 30), manager = process.argv[4] ?? 'm3';
const tick = st => { st.date.week++; if (st.date.week > 52) { st.date.week = 1; st.date.year++; } };
const fresh = seed => {
  const s = N.newNsdCareer({ first: 'C', last: 'K', nation: 'DE', age: 25, slot: 1, seed });
  s.team = { manager, trainer: null }; C.nameTeam(s); s.player.star.level = level; s.player.rel.fans = 70; s.player.rel.sponsors = 50; s.player.rel.manager = 60; s.stars = 8000;
  return s;
};
const unitOf = s => C.sponsorBase(s) * C.managerOf(s).mult * N.starFactor(level) * R.SPONSOR_PAY;   // Version 93: wie im Spiel × SPONSOR_PAY
function sim(seed, withCtrl, len, horizon) {
  const rng = new RNG(seed * 7919 + (withCtrl ? 1 : 1)), s = fresh(seed % 50 + 1), unit = unitOf(s);
  s.nsdSponsors = { active: ['Würth', 'Tipico', 'Zalando', 'Bitburger'].map((n, i) => ({ name: n, branche: R.brancheOfName(n), real: true, fame: 3 + (i % 2), perWeek: Math.round(unit * [1.15, 1.4, 1.4, 1.15][i] * rng.float(0.85, 1.15)), win: 10, s180: 0, major: 0, weeksLeft: rng.int(10, 50) })), offer: null, cAt: 1e9 };
  const st0 = s.stars; let gone = 0, sev = 0, mega = 0, mgr = 0;
  if (withCtrl) {
    s.nsdSponsors.cOffer = { name: 'Rheinmetall', sector: 'Rüstung', tag: 'x', perWeek: Math.round(unit * rng.float(0.8, 1.2) * X.CONTROVERSIAL_PAY), win: 0, weeks: 4, length: len };
    s.nsdSponsors.cOffer.win = Math.round(s.nsdSponsors.cOffer.perWeek * 0.4); C.acceptControversial(s);
  }
  for (let w = 0; w < horizon; w++) {
    tick(s); const nn = C.normalContracts(s).length, news0 = s.news.length;
    C.sponsorWeek(s, rng);
    for (const n of s.news.slice(0, s.news.length - news0)) { if (n.title.includes('Skandal um')) sev++; if (n.title.includes('Mega-Skandal')) mega++; if (n.title.includes('Manager-Krach')) mgr++; }
    const o = s.nsdSponsors.offer; if (o && !C.offerConflict(s)) C.acceptOffer(s); else if (o && C.offerConflict(s)?.kind === 'branche') C.acceptOffer(s);
    s.nsdSponsors.cOffer = null;
    s.player.rel.fans = Math.min(100, s.player.rel.fans + 0.25);
  }
  return { gain: s.stars - st0, sev, mega, mgr, fans: s.player.rel.fans };
}
const pct = (a, q) => a.slice().sort((x, y) => x - y)[Math.floor(q * (a.length - 1))];
let all = [], good = 0, sevRuns = 0;
for (const len of X.CONTROVERSY_LENGTHS) {
  const H = len + 26, base = []; for (let i = 0; i < runs; i++) base.push(sim(i + 1, false, len, H).gain);
  const mb = base.reduce((a, b) => a + b, 0) / base.length, d = [];
  let g = 0, sv = 0, fansEnd = 0;
  for (let i = 0; i < runs; i++) { const r = sim(i + 1000, true, len, H); d.push(r.gain - mb); if (r.gain - mb > 0) g++; if (r.sev + r.mega > 0) sv++; fansEnd += r.fans; }
  console.log(`Laufzeit ${len} Wochen (Horizont ${H}): lohnt sich in ${(g / runs * 100).toFixed(0)} % | Ø Netto ${Math.round(d.reduce((a, b) => a + b, 0) / d.length)} ★ (Median ${Math.round(pct(d, 0.5))}, 10 % ${Math.round(pct(d, 0.1))}, 90 % ${Math.round(pct(d, 0.9))}) | schwerer/Mega-Skandal in ${(sv / runs * 100).toFixed(0)} % | Fans am Ende Ø ${(fansEnd / runs).toFixed(0)} | Baseline ${Math.round(mb)} ★`);
  all.push(...d); good += g; sevRuns += sv;
}
const tot = runs * X.CONTROVERSY_LENGTHS.length;
console.log(`GESAMT (Status ${level}, ${manager}): lohnt sich in ${(good / tot * 100).toFixed(0)} % der Verträge, Ø Netto ${Math.round(all.reduce((a, b) => a + b, 0) / all.length)} ★, schwerer Skandal in ${(sevRuns / tot * 100).toFixed(0)} %`);
