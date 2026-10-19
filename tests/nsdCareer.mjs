// Kalibrierung New Star Darts: ein Bot spielt mehrere Saisons (Training, Getränke, Turniere, Ereignisse, Team, Sponsoren, Shop)
// Aufruf: node tests/nsdCareer.mjs [Saisons=5] [Seed=1] [Trainingsquote 0–1=0.6]
import * as N from '../js/nsd.js';
import * as T from '../js/skilltrain.js';
import * as L from '../js/life.js';
import * as C from '../js/career.js';
import { RNG } from '../js/rng.js';
import { eventsInWeek, shownTo } from '../js/calendar.js';
import { eventStatus, enterEvent, simulateRest, nextSub, closeEvent } from '../js/tournaments.js';
import { nextWeek } from '../js/season.js';
import { rankOf } from '../js/rankings.js';
import { DRINKS } from '../data/gear.js';
import { LIFESTYLE } from '../data/lifestyle.js';

const seasons = +(process.argv[2] ?? 5), seed = +(process.argv[3] ?? 1), skillQ = +(process.argv[4] ?? 0.6);
const s = N.newNsdCareer({ first: 'Bot', last: 'Spieler', nation: 'DE', age: 20, seed });
const p = s.player, rng = new RNG({ s: seed * 7 + 1 });
for (const t of N.TRAINABLE) T.finishTraining(s, t.key, 1, rng.int(1, 3), { placement: true });
p.assessed = true;
const out = [];
let yearWins = 0, lowE = 0;
const play = () => {
  for (;;) {
    simulateRest(s);
    if (!s.activeEvent.hasNext) break;
    nextSub(s);
  }
  closeEvent(s);
  if (s.interview) { for (let i = 0; i < 3; i++) C.answerInterview(s, 1, rng); s.interview = null; }
};
while (s.date.year < N.NSD_START.year + seasons && !s.ended) {
  // Ereignis
  if (s.lifeEvent) {
    const v = L.lifeEventView(s), o = v.opts.find(x => !x.tired && x.cost <= (s.stars ?? 0)) ?? v.opts[v.opts.length - 1];
    try { L.resolveLifeEvent(s, o.i, rng); } catch { s.lifeEvent = null; }
  }
  // Team, Sponsoren, Shop
  for (const m of [...C.managersOf(s)].reverse()) if (C.managerOk(s, m) && s.team?.manager !== m.id) { try { C.fireManager(s, false); C.hireManager(s, m.id); } catch { } break; }
  if (s.nsdSponsors?.offer) C.acceptOffer(s);
  if (!p.fitness && s.stars > 60) try { C.hireTrainer(s, C.trainerOffers(s).at(-1).id); } catch { }
  const cheap = LIFESTYLE.filter(x => !p.owned?.includes(x.id)).sort((a, b) => a.price - b.price)[0];
  if (cheap && s.stars > 3 * L.itemPrice(cheap, p.star.level)) L.buyItem(s, cheap.id);
  // Training (Erfolg je nach „Spielerqualität“ skillQ), vorher bei Bedarf Bier
  if (p.energy < T.TRAIN_ENERGY && s.stars >= T.drinkPrice(DRINKS[0], p.star.level) + 3) { T.buyDrink(s, 'beer'); T.drink(s, 'beer', rng); }
  const key = [...N.TRAINABLE].sort((a, b) => N.skillValue(p, a.key) - N.skillValue(p, b.key))[0].key, lv = T.nextLevel(p, key);
  if (lv && T.canTrain(s, key, lv).ok) {
    T.startTraining(s, key, lv);
    const att = [1, 2, 3].find(() => rng.chance(skillQ * (1 - lv / 40))) ?? 0;
    T.finishTraining(s, key, lv, att);
  }
  // Turniere der Woche
  for (const ev of eventsInWeek(s, s.date.year, s.date.week)) {
    if (!shownTo(s, ev) || !eventStatus(s, ev).playable) continue;
    if (p.energy < 70 && s.stars >= T.drinkPrice(DRINKS[0], p.star.level)) { T.buyDrink(s, 'beer'); T.drink(s, 'beer', rng); }   // fit ins Turnier
    lowE += p.energy < 20 ? 1 : 0;
    const before = s.stats.career.wins;
    enterEvent(s, ev.id); play();
    yearWins += s.stats.career.wins - before;
  }
  const y = s.date.year;
  if (!nextWeek(s)) throw new Error('Woche hängt');
  if (s.date.year !== y || s.ended) {
    out.push({ jahr: y, status: p.star.level, rang: s.seasonReport?.rank ?? rankOf(s, 'pdc', 'P'), siege: `${s.seasonReport?.wins}/${s.seasonReport?.matches}`,
      titel: s.seasonReport?.titles.length ?? 0, sterne: s.stars, faehig: Math.round(N.skillsAvg(p)), zufr: Math.round(p.satisfaction),
      lifestyle: L.lifestyleOf(p), fans: Math.round(p.rel.fans), ms: Object.keys(s.achievements ?? {}).length, unfit: lowE, karte: p.cardUntil ?? '–', ende: !!s.ended });
    yearWins = 0; lowE = 0;
  }
}
console.table(out);
