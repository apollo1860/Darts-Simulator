// New Star Darts: umstrittene Sponsoren (Version 73, Nutzerliste). Ab Star-Status 25 bietet ca. alle 1–2 Jahre eine umstrittene Firma einen
// Vertrag an: zahlt sehr gut (CONTROVERSIAL_PAY × normaler Wochenbetrag), führt aber zu Fan-Problemen, und andere Sponsoren können abspringen.
// Solche Verträge sind von der Branchenregel ausgenommen und zählen nicht zu den höchstens 5 Sponsoren – niemand muss dafür gekündigt werden.
// Es läuft immer höchstens ein umstrittener Vertrag gleichzeitig. Die Vorfälle sind Spielszenen (Protest, Boykottaufrufe, Presse).
export const CONTROVERSIAL_FROM = 25;
export const CONTROVERSIAL_PAY = 2.6;        // Bezahlfaktor (zum Vergleich: bekannteste normale Marke ×1,7)
export const CONTROVERSY_FIRST = [26, 78];   // Wochen bis zum ersten Angebot nach Erreichen von Status 25
export const CONTROVERSY_GAP = [52, 104];    // Wochen bis zum nächsten Angebot (1–2 Jahre)
export const CONTROVERSY_OFFER_WEEKS = 4;    // so lange gilt ein Angebot
export const CONTROVERSY_SIGN_FANS = -3;     // Empörung beim Unterschreiben
export const CONTROVERSY_EVENT = 0.15;       // Chance je Woche mit laufendem Vertrag auf einen Vorfall
// Version 74: Die Folgen können so heftig sein, dass sich der Deal nicht lohnt. Kalibriert mit einer Simulation (tests/calibCtrl.mjs): nur etwa
// 42–49 % der Verträge lohnen sich in ★ (Laufzeit + 26 Wochen, gegenüber „kein Vertrag“), Ø Netto ≈ −1.000 ★; Fans/Zufriedenheit/Manager kommen dazu.
// Vorfälle (w = Gewicht in %, Summe 100): minor Boykottaufruf · fans Proteste · leave ein Sponsor springt ab · pr Krisen-PR (kostet ★) ·
// severe schwerer Skandal (mehrere Sponsoren weg, Sponsoren-Sperre = keine neuen normalen Angebote) · manager Manager-Krach ·
// mega Mega-Skandal (fast alle Sponsoren weg, lange Sperre, teure PR). cost = Vielfache des Wochenbetrags der umstrittenen Firma (★).
export const CONTROVERSY_KINDS = [
  { kind: 'minor', w: 15 }, { kind: 'fans', w: 28 }, { kind: 'leave', w: 18 }, { kind: 'pr', w: 12 }, { kind: 'severe', w: 17 }, { kind: 'manager', w: 6 }, { kind: 'mega', w: 4 },
];
export const CONTROVERSY_PARAMS = {
  rate: CONTROVERSY_EVENT,
  fans: { loss: [2, 5] },
  leave: { rel: 4 },
  pr: { fans: 3, cost: 4 },
  severe: { fans: [8, 15], sat: 3, leave: [1, 3], block: 10, cost: 5 },
  manager: { rel: [18, 30], fans: 3 },
  mega: { fans: [20, 30], sat: 6, leaveP: 0.7, block: 20, cost: 10 },
};
export const CONTROVERSY_LENGTHS = [26, 39, 52];

export const CONTROVERSIAL = [
  { name: 'Gazprom', sector: 'Energie & Gas', tag: 'Russischer Staatskonzern',
    scandal: ['Fans rufen zum Boykott auf – ein russischer Staatskonzern als Sponsor?', 'Eine Zeitung titelt: „Darts-Star kassiert Gazprom-Gelder“.'] },
  { name: 'Aramco', sector: 'Öl & Energie', tag: 'Saudischer Ölkonzern',
    scandal: ['Klimaaktivisten halten bei deinem Match Banner hoch.', 'Im Netz wird dir Greenwashing vorgeworfen.'] },
  { name: 'Rheinmetall', sector: 'Rüstung', tag: 'Rüstungskonzern',
    scandal: ['Friedensinitiativen protestieren vor der Halle.', 'Fans streiten hitzig: Darts und Rüstungsgeld – passt das?'] },
  { name: 'Nestlé', sector: 'Lebensmittel', tag: 'Lebensmittelkonzern in der Kritik',
    scandal: ['Ein Boykottaufruf gegen Nestlé trifft auch dich.', 'Eine Dokumentation kritisiert den Konzern – du musst erklären, warum du dabei bist.'] },
  { name: 'Pornhub', sector: 'Erwachsenen-Unterhaltung', tag: 'Erwachsenen-Portal',
    scandal: ['Eltern und Verbände schimpfen über das Logo auf deinem Trikot.', 'Die Boulevardpresse macht ein Riesenthema daraus.'] },
  { name: 'Heckler & Koch', sector: 'Waffen', tag: 'Waffenhersteller',
    scandal: ['Eine Mahnwache protestiert gegen Waffenhersteller im Sport.', 'Die Fans sind gespalten – viele wenden sich ab.'] },
  { name: 'Monsanto', sector: 'Agrochemie', tag: 'Agrochemie-Konzern',
    scandal: ['Umweltgruppen verteilen Flugblätter vor der Halle.', 'Im Netz geht ein Protest-Hashtag durch die Decke.'] },
  { name: 'OnlyFans', sector: 'Erwachsenen-Plattform', tag: 'Abo-Plattform für Erwachsenen-Inhalte',
    scandal: ['Streit in den Kommentarspalten: Passt das zu Darts?', 'Ein Fanclub kündigt einen Protest an.'] },
  { name: 'RussiaToday Deutsch', sector: 'Medien', tag: 'Staatsmedium',
    scandal: ['Medien werfen dir vor, Propaganda zu finanzieren.', 'Der Verband bittet um eine Stellungnahme zu deinem Sponsor.'] },
  { name: 'Truth Social', sector: 'Soziales Netzwerk', tag: 'Politisch umstrittenes Netzwerk',
    scandal: ['Die Fans streiten politisch – manche feiern, viele wenden sich ab.', 'Dein Postfach quillt über vor wütenden Nachrichten.'] },
];
