// Zubehör-Shop: Boosts auf Fähigkeiten für eine Anzahl eigener Matches (Preise in Basis-★, × Status-Faktor)
// 3 Flights + 3 Barrels mit unterschiedlichem Schwerpunkt
export const ACCESSORIES = [
  // Flights
  { id: 'fl-falcon', icon: '🪶', type: 'Flight', name: 'Falcon Glide', price: 3, matches: 3, bonus: { sco: 2 } },
  { id: 'fl-viper', icon: '🪶', type: 'Flight', name: 'Viper Fang', price: 5, matches: 4, bonus: { fin: 3 } },
  { id: 'fl-phantom', icon: '🪶', type: 'Flight', name: 'Phantom Stealth', price: 8, matches: 5, bonus: { foc: 3, cal: 2 } },
  // Barrels
  { id: 'br-hammer', icon: '🎯', type: 'Barrel', name: 'Thunder Hammer', price: 6, matches: 3, bonus: { sco: 4 } },
  { id: 'br-scalpel', icon: '🎯', type: 'Barrel', name: 'Ice Scalpel', price: 9, matches: 4, bonus: { fin: 3, cal: 3 } },
  { id: 'br-titan', icon: '🎯', type: 'Barrel', name: 'Black Titan', price: 15, matches: 5, bonus: { sco: 3, fin: 3, foc: 2 } },
];
