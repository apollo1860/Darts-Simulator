// Dilemma-Situationen (Version 107, Nutzerwunsch wie im Vorbild): alle 3–7 Wochen zwei Lebensbereiche zur Wahl – wofür nimmst du dir Zeit?
// Je Bereich mehrere Aktivitäten mit eigener kleiner Grafik (js/ui/nsd/art/dilemma.js, Schlüssel `art`).
export const DILEMMA_WEEKS = [3, 7];          // Abstand in Wochen (zufällig)
export const DILEMMA_GAIN = [4, 6], DILEMMA_LOSS = [2, 4];   // Beziehung: gewählt + (4–6), die andere − (2–4)
export const DILEMMA_ACTS = {
  fans: [
    { id: 'autograph', label: 'Autogramme schreiben', art: 'autograph' },
    { id: 'meetgreet', label: 'Fan-Treffen mit Selfies', art: 'selfie' },
  ],
  manager: [
    { id: 'strategy', label: 'Strategiegespräch im Büro', art: 'meeting' },
    { id: 'golf', label: 'Golfrunde mit dem Manager', art: 'golf' },
  ],
  sponsors: [
    { id: 'shoot', label: 'Fotoshooting für die Kampagne', art: 'photo' },
    { id: 'expo', label: 'Auftritt am Messestand', art: 'booth' },
  ],
  partner: [
    { id: 'dinner', label: 'Romantisches Abendessen', art: 'dinner' },
    { id: 'cinema', label: 'Kinoabend zu zweit', art: 'cinema' },
  ],
};
