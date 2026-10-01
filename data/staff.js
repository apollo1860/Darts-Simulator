// Team: Manager (Provision auf alle Einnahmen) und Trainer (Einmalzahlung für 1 Jahr). Namen fiktiv.
// Manager: cut = Anteil an Preisgeld/Sponsoren/Exhibitions; offer = Sponsor-Angebotschance (statt 60 %), amount = Faktor
// Sponsorhöhe, gig = Chance pro Woche auf eine Exhibition-Einladung, gigFee = Faktor Gage. unlock = Bedingung.
export const MANAGERS = [
  { id: 'm1', name: 'Kai Lorenz Sportmanagement', tier: 1, cut: 0.10, offer: 0.75, amount: 1.10, maxOffers: 3, gig: 0.20, gigFee: 1.2, unlock: 'card', note: 'Kleine Agentur, gute Kontakte in die Region' },
  { id: 'm2', name: 'Arrows & Partners', tier: 2, cut: 0.15, offer: 0.90, amount: 1.25, maxOffers: 4, gig: 0.30, gigFee: 1.5, unlock: 'top64', note: 'Betreut mehrere Tour-Profis' },
  { id: 'm3', name: 'Oche Global Management', tier: 3, cut: 0.20, offer: 1.00, amount: 1.45, maxOffers: 5, gig: 0.40, gigFee: 2.0, unlock: 'top16', note: 'Die großen Namen – TV, Werbung, Showkämpfe' },
];
export const MANAGER_UNLOCK = { card: 'Ab erster Tourcard', top64: 'Ab Top 64 der PDC OOM', top16: 'Ab Top 16 der PDC OOM' };

// Trainer: XP-Bonus auf alle XP + schnellerer Trainingsfortschritt, 1 Jahr (52 Wochen) ab Vertragsbeginn
export const COACHES = [
  { id: 'c1', name: 'Vereinstrainer Bernd Kohl', tier: 1, price: 1500, xp: 0.10, note: 'Grundlagen, Wurfrhythmus' },
  { id: 'c2', name: 'Landestrainerin Sabine Roth', tier: 2, price: 6000, xp: 0.20, note: 'Doppel-Training, Matchpraxis' },
  { id: 'c3', name: 'Profi-Coach Glen Hartley', tier: 3, price: 18000, xp: 0.30, note: 'Ex-Tourspieler, Mentaltraining' },
];

export const GIG_CITIES = ['Hamburg', 'Köln', 'München', 'Berlin', 'Leipzig', 'Dortmund', 'Wien', 'Zürich', 'Amsterdam', 'Antwerpen',
  'Glasgow', 'Cardiff', 'Belfast', 'Dublin', 'Kopenhagen', 'Oslo', 'Prag', 'Gibraltar'];
export const GIG_KINDS = ['Showkampf im Festzelt', 'Firmenevent', 'Darts-Gala', 'Vereinsjubiläum', 'Charity-Abend', 'Kneipen-Tour'];
