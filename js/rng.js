// Seedbarer Zufallsgenerator (mulberry32). Zustand liegt in einem Objekt {s},
// damit er im Spielstand mitgespeichert werden kann.
export class RNG {
  constructor(holder) {
    if (typeof holder === 'number') holder = { s: holder >>> 0 };
    this.h = holder;
  }
  next() {
    let t = (this.h.s = (this.h.s + 0x6D2B79F5) >>> 0);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  float(min, max) { return min + (max - min) * this.next(); }
  int(min, max) { return min + Math.floor(this.next() * (max - min + 1)); }
  chance(p) { return this.next() < p; }
  pick(arr) { return arr[Math.floor(this.next() * arr.length)]; }
  normal(mean = 0, sd = 1) {
    let u = 0, v = 0;
    while (u === 0) u = this.next();
    v = this.next();
    return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}

// Deterministischer Hash (z. B. für Wochen-Events) → Seed
export function hashSeed(...parts) {
  let h = 2166136261 >>> 0;
  for (const ch of parts.join('|')) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

export const randomSeed = () => (Math.random() * 4294967296) >>> 0;
