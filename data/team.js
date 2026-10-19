// New Star Darts: Team (fiktiv), Interview-Fragen. Beträge in Basis-★ (× starFactor).
// Manager: Provision auf Preisgeld, Sponsor-Angebote (Chance/Woche, Betragsfaktor), Voraussetzung Star-Status oder PDC-Rang.
export const MANAGERS = [
  { id: 'm1', name: 'Kalle Kröger', icon: '🧔', cut: 0.10, offer: 0.22, mult: 1.0, needStar: 1, needRank: null, info: 'Kumpeltyp aus der Kneipenszene' },
  { id: 'm2', name: 'Sandra Voss', icon: '👩‍💼', cut: 0.15, offer: 0.32, mult: 1.3, needStar: 10, needRank: 64, info: 'Gut vernetzt bei Sponsoren' },
  { id: 'm3', name: 'Victor Lennox', icon: '🕴️', cut: 0.20, offer: 0.45, mult: 1.7, needStar: 30, needRank: 16, info: 'Holt die ganz großen Deals' },
];
// Fitnesstrainer: Wochengebühr, Energie-Erholung pro Woche
export const TRAINERS = [
  { id: 'f1', name: 'Fitness-Studio-Coach', icon: '🏃', fee: 1, regen: 6 },
  { id: 'f2', name: 'Athletiktrainer Brandt', icon: '🏋️', fee: 3, regen: 12 },
  { id: 'f3', name: 'Sportwissenschaftlerin Dr. Ilić', icon: '🧬', fee: 6, regen: 18 },
];
// Interview: je Frage 3 Antworten – humble (bescheiden), proud (selbstbewusst), cocky (großspurig)
export const INTERVIEW_QS = [
  { q: 'Wie fühlt sich dieser Erfolg an?', a: ['Ich bin einfach dankbar, hier sein zu dürfen.', 'Ich habe hart dafür gearbeitet – verdient!', 'Ehrlich? Das war erst der Anfang. Die anderen sollten sich warm anziehen.'] },
  { q: 'Was war heute der Schlüssel?', a: ['Ein bisschen Glück bei den Doppeln.', 'Mein Scoring war konstant stark.', 'Ich bin einfach besser als alle hier.'] },
  { q: 'Was sagst du zu deinem Gegner?', a: ['Großer Respekt, er hat super gespielt.', 'Er hat gut dagegengehalten, aber ich war heute dran.', 'Gegner? Ich hab kaum gemerkt, dass jemand da war.'] },
  { q: 'Was sind deine nächsten Ziele?', a: ['Schritt für Schritt, Woche für Woche.', 'Ich will in die Top 16 – mindestens.', 'Weltmeister. Nächstes Jahr. Schreibt es auf.'] },
  { q: 'Wie wichtig sind dir die Fans?', a: ['Ohne sie wäre ich nichts.', 'Die Stimmung hat mich heute getragen.', 'Die kommen doch wegen mir.'] },
  { q: 'Wie hast du dich vorbereitet?', a: ['Ganz normal trainiert, nichts Besonderes.', 'Viel Training an den Doppeln – hat sich ausgezahlt.', 'Vorbereitung? Talent reicht.'] },
];
export const STYLE_LABEL = ['bescheiden', 'selbstbewusst', 'großspurig'];
