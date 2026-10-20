// Zubehör-Shop: Boosts auf Fähigkeiten für eine Anzahl eigener Matches (Preise in Basis-★, × Status-Faktor)
export const ACCESSORIES = [
  { id: 'fl-std', icon: '🪶', name: 'Standard-Flights', price: 2, matches: 3, bonus: { sco: 1 } },
  { id: 'fl-slim', icon: '🪶', name: 'Slim-Flights', price: 3, matches: 3, bonus: { fin: 1 } },
  { id: 'shafts', icon: '📏', name: 'Alu-Shafts', price: 4, matches: 4, bonus: { sco: 1, fin: 1 } },
  { id: 'grip', icon: '🧤', name: 'Grip-Wachs', price: 3, matches: 2, bonus: { fin: 2 } },
  { id: 'cap', icon: '🧢', name: 'Glücks-Cap', price: 4, matches: 5, bonus: { foc: 2 } },
  { id: 'chalk', icon: '🧮', name: 'Checkout-Spickzettel', price: 4, matches: 4, bonus: { cal: 3 } },
  { id: 'fl-pro', icon: '🪶', name: 'Pro-Flights', price: 8, matches: 5, bonus: { sco: 2, fin: 2 } },
  { id: 'shirt', icon: '👕', name: 'Glücks-Trikot', price: 10, matches: 6, bonus: { foc: 2, cal: 2 } },
  { id: 'test', icon: '🎯', name: 'Leih-Darts (Testset)', price: 12, matches: 3, bonus: { sco: 3, fin: 3 } },
  { id: 'kit', icon: '🧰', name: 'Profi-Zubehör-Set', price: 25, matches: 8, bonus: { sco: 3, fin: 3, foc: 2, cal: 2 } },
];
