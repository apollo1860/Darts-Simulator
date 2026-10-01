import { RNG } from '../js/rng.js';
import { simulateMatch } from '../js/matchEngine.js';
import { attrsForAverage } from '../js/player.js';
const rng = new RNG(42);
for (const avg of [60, 70, 80, 90, 100, 105]) {
  const a = attrsForAverage(avg, rng, 0);
  let pts=0,d=0,h=0,at=0,s180=0,legs=0, hi=0;
  for (let i=0;i<400;i++){ const r = simulateMatch(a, a, {legs:6}, rng); for(const s of r.stats){pts+=s.points;d+=s.darts;h+=s.coHit;at+=s.coAtt;s180+=s.s180;hi=Math.max(hi,s.hiFinish)} legs+=r.legsTotal[0]+r.legsTotal[1]; }
  console.log(avg, 'avg', (pts/d*3).toFixed(1), 'co%', (h/at*100).toFixed(1), '180/leg', (s180/legs).toFixed(2), 'darts/leg', (d/legs/2).toFixed(1), 'hi', hi);
}
// Stärkeunterschiede
const w = (x,y,n=1000)=>{const A=attrsForAverage(x,rng,0),B=attrsForAverage(y,rng,0);let c=0;for(let i=0;i<n;i++) if(simulateMatch(A,B,{legs:3},rng).winner===0)c++;return c/n;};
console.log('62 vs 70 (ft3):', w(62,70), ' 62 vs 62:', w(62,62), ' 95 vs 90:', w(95,90), ' 100 vs 85', w(100,85));
const t=performance.now(); const A=attrsForAverage(90,rng),B=attrsForAverage(88,rng); for(let i=0;i<2000;i++) simulateMatch(A,B,{legs:6},rng); console.log('2000 Matches ms', (performance.now()-t).toFixed(0));
