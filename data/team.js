// New Star Darts: Team (fiktiv), Interview-Fragen. Beträge in Basis-★ (× starFactor).
// Manager: Provision auf Preisgeld, Sponsor-Angebote (Chance/Woche, Betragsfaktor), Voraussetzung Star-Status oder PDC-Rang.
export const MANAGERS = [
  { id: 'm1', name: 'Kalle Kröger', icon: '🧔', cut: 0.10, offer: 0.08, mult: 0.7, tier: 1, needStar: 1, needRank: null, info: 'Kumpeltyp aus der Kneipenszene' },
  { id: 'm2', name: 'Sandra Voss', icon: '👩‍💼', cut: 0.15, offer: 0.25, mult: 1.4, tier: 2, needStar: 10, needRank: 64, info: 'Gut vernetzt bei Sponsoren' },
  { id: 'm3', name: 'Victor Lennox', icon: '🕴️', cut: 0.20, offer: 0.50, mult: 2.5, tier: 3, needStar: 30, needRank: 16, info: 'Holt die ganz großen Deals' },
];
// Fitnesstrainer: zufällige Angebote (career.js: trainerOffers) – Titel und Symbole
export const TRAINER_TITLES = ['Fitness-Coach', 'Athletiktrainer', 'Physiotherapeut', 'Personal Trainer', 'Sportwissenschaftler Dr.', 'Yoga-Coach', 'Ernährungsberater', 'Mentaltrainer'];
export const TRAINER_ICONS = ['🏃', '🏋️', '🧘', '🥗', '🧬', '💆', '🚴'];
// Interview: je Frage 3 Antworten – humble (bescheiden), proud (selbstbewusst), cocky (großspurig)
export const INTERVIEW_QS = [
  { q: 'Wie fühlt sich dieser Erfolg an?', a: ['Ich bin einfach dankbar, hier sein zu dürfen.', 'Ich habe hart dafür gearbeitet – verdient!', 'Ehrlich? Das war erst der Anfang. Die anderen sollten sich warm anziehen.'] },
  { q: 'Was war heute der Schlüssel?', a: ['Ein bisschen Glück bei den Doppeln.', 'Mein Scoring war konstant stark.', 'Ich bin einfach besser als alle hier.'] },
  { q: 'Was sagst du zu deinem Gegner?', a: ['Großer Respekt, er hat super gespielt.', 'Er hat gut dagegengehalten, aber ich war heute dran.', 'Gegner? Ich hab kaum gemerkt, dass jemand da war.'] },
  { q: 'Was sind deine nächsten Ziele?', a: ['Schritt für Schritt, Woche für Woche.', 'Ich will in die Top 16 – mindestens.', 'Weltmeister. Nächstes Jahr. Schreibt es auf.'] },
  { q: 'Wie wichtig sind dir die Fans?', a: ['Ohne sie wäre ich nichts.', 'Die Stimmung hat mich heute getragen.', 'Die kommen doch wegen mir.'] },
  { q: 'Wie hast du dich vorbereitet?', a: ['Ganz normal trainiert, nichts Besonderes.', 'Viel Training an den Doppeln – hat sich ausgezahlt.', 'Vorbereitung? Talent reicht.'] },
];
// Beziehungs-Aktionen (Tippen im Leben-Screen): zufällige Aktion, kostet 60 % Energie, Beziehung +REL_GAIN
export const REL_ACTIONS = {
  fans: ['Autogrammstunde', 'Twitch-Livestream', 'Grußbotschaft', 'Give-Away', 'Make-A-Wish-Foundation'],
  manager: ['Meet & Greet mit potenziellen Sponsoren', 'Fotoshooting für Werbeflyer', 'Gemeinsam essen gehen', 'Gemeinsam etwas trinken'],
  sponsors: ['Fotoshooting für Werbung', 'Instagram-Post', 'Meet & Greet', 'Gemeinsam essen gehen', 'Autogrammkarten unterschreiben'],
  partner: ['Blumenstrauß', 'Parfüm', 'Kurztrip', 'Schmuck', 'Candle-Light-Dinner'],
};
export const STYLE_LABEL = ['bescheiden', 'selbstbewusst', 'großspurig'];
