// Fiktive Sponsoren. tier: 1 = regional (früh), 2 = national, 3 = international (nur Top-Spieler)
// Kategorien = Vertragsplätze (je Kategorie nur ein aktiver Sponsor → max. 4)
export const SPONSOR_SLOTS = {
  gear: { label: 'Darts-Ausrüster', icon: '🎯' },
  shirt: { label: 'Trikot', icon: '👕' },
  drink: { label: 'Getränk', icon: '🥤' },
  partner: { label: 'Partner', icon: '🤝' },
};

export const SPONSORS = [
  { name: 'Arrowcraft Darts', slot: 'gear', tier: 1 }, { name: 'Tungsten Tom', slot: 'gear', tier: 1 },
  { name: 'Flightline Pro', slot: 'gear', tier: 2 }, { name: 'Bullhaus Darts', slot: 'gear', tier: 2 },
  { name: 'Apex Tungsten', slot: 'gear', tier: 3 }, { name: 'Ninefinity', slot: 'gear', tier: 3 },
  { name: 'Kneipenkönig Wear', slot: 'shirt', tier: 1 }, { name: 'Oche Couture', slot: 'shirt', tier: 1 },
  { name: 'Shotglass Sportswear', slot: 'shirt', tier: 2 }, { name: 'Triple Twenty Apparel', slot: 'shirt', tier: 2 },
  { name: 'Matchdart Athletics', slot: 'shirt', tier: 3 },
  { name: 'Bullseye Energy', slot: 'drink', tier: 1 }, { name: 'Brauerei Doppelfeld', slot: 'drink', tier: 1 },
  { name: 'Checkout Cola', slot: 'drink', tier: 2 }, { name: 'Ton-80 Lager', slot: 'drink', tier: 2 },
  { name: 'Hydra Oche Water', slot: 'drink', tier: 3 },
  { name: 'Autohaus Bogenschütz', slot: 'partner', tier: 1 }, { name: 'Pfeil & Partner Immobilien', slot: 'partner', tier: 1 },
  { name: 'Leg-Bank', slot: 'partner', tier: 2 }, { name: 'DartBet Sports', slot: 'partner', tier: 2 },
  { name: 'Nexus Gaming', slot: 'partner', tier: 3 }, { name: 'Crown Airlines', slot: 'partner', tier: 3 },
];

// Vertragsarten
export const CONTRACT_TYPES = {
  annual: { label: 'Jahresgehalt', info: 'feste Summe pro Jahr, ausgezahlt quartalsweise' },
  event: { label: 'Antrittsgeld', info: 'Betrag für jedes gespielte Profi-Turnier (Pro Tour, Majors, PL, WS)' },
  bonus: { label: 'Erfolgsbonus', info: 'Bonus ab Halbfinale, Titel zählt dreifach' },
};
