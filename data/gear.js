// New Star Darts: Getränke und Darts (fiktiv). Preise = Basis bei Star-Status 1 (× starFactor).
// Getränke: Energie sofort auf 100 %; Schnaps/Wodka zusätzlich „Rausch“ = Bonuspunkte auf alle trainierbaren Fähigkeiten bis Wochenende,
// Wodka außerdem Beziehung +1 (niedrigste bestehende).
// Vorrat: von jedem Getränk höchstens so viele gleichzeitig (Version 81)
export const DRINK_MAX = 25;
export const DRINKS = [
  { id: 'beer', name: 'Bier', icon: '🍺', price: 1, energy: 100, buzz: 0, rel: 0 },
  { id: 'schnaps', name: 'Schnaps', icon: '🥃', price: 3, energy: 100, buzz: 2, rel: 0 },
  { id: 'wodka', name: 'Wodka', icon: '🍸', price: 5, energy: 100, buzz: 3, rel: 1 },
];
// Darts: dauerhafter Bonus (Fähigkeitspunkte), solange ausgerüstet
// Version 121: Man besitzt immer Darts und Flights – der Brass Dart (9 g) und der Standard-Flight sind kostenlos, automatisch im Besitz und ohne Wirkung.
export const STARTER_DART = 'brass9';
export const STARTER_FLIGHT = { name: 'Standard-Flight', note: 'kostenlos · ohne Wirkung' };
export const DARTS = [
  { id: 'brass9', name: 'Brass Dart 9 g', price: 0, bonus: {}, starter: true },
  { id: 'brass', name: 'Messing 18 g', price: 10, bonus: { sco: 1 } },
  { id: 't80', name: 'Tungsten 80 % 22 g', price: 35, bonus: { sco: 2, fin: 1 } },
  { id: 't90', name: 'Tungsten 90 % 23 g', price: 80, bonus: { sco: 3, fin: 2, foc: 1 } },
  { id: 't95', name: 'Pro 95 % 24 g', price: 170, bonus: { sco: 4, fin: 3, foc: 2 } },
  { id: 'sig', name: 'Signature Black 97 %', price: 350, bonus: { sco: 6, fin: 4, foc: 3, cal: 1 } },
];
