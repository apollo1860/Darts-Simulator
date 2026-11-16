// Version 125 (Nutzerwunsch): Interview nach einer Niederlage im Finale oder Halbfinale – eigene Fragen, die nicht nach Sieg klingen.
// Gleiches Format wie RESULT_QS (data/talk.js): je Antwort ein Ton (career.js toneEffect) und kleine Zusatzwirkung fx.
export const LOSS_QS = [
  { q: 'Wie groß ist die Enttäuschung gerade?', a: [
    { t: 'Riesig. Aber ich nehme trotzdem viel Positives mit.', tone: 'honest', fx: { sat: -1 } },
    { t: 'Es tut weh, aber so ist Sport. Kopf hoch.', tone: 'humble', fx: { fans: 1 } },
    { t: 'Ich bin stinksauer. Das nächste Mal bin ich dran.', tone: 'fiery', fx: { sponsors: -1 } },
    { t: 'Gib mir zehn Minuten und ein großes Bier, dann geht’s wieder.', tone: 'funny', fx: { manager: -1 } }] },
  { q: 'Woran lag es heute?', a: [
    { t: 'An den Doppeln. Da habe ich zu viele liegen lassen.', tone: 'honest', fx: { mom: -1 } },
    { t: 'Mein Gegner war einfach besser, Glückwunsch an ihn.', tone: 'humble', fx: { sponsors: 1 } },
    { t: 'An Kleinigkeiten. Eigentlich war ich der bessere Spieler.', tone: 'cocky', fx: { fans: -1 } },
    { t: 'Das analysiere ich in Ruhe mit meinem Team.', tone: 'evasive', fx: { manager: 1 } }] },
  { q: 'Was sagst du zu deinem Gegner?', a: [
    { t: 'Er hat den Sieg verdient. Großes Kompliment.', tone: 'humble', fx: { fans: 1 } },
    { t: 'Heute er, nächstes Mal ich. Wir sehen uns wieder.', tone: 'fiery', fx: { mom: 1 } },
    { t: 'Er hatte heute das Glück auf seiner Seite.', tone: 'cocky', fx: { sponsors: -1 } },
    { t: 'Wir sind gute Kumpels – ich gönne es ihm von Herzen.', tone: 'emotional', fx: { partner: 1 } }] },
  { q: 'Gab es einen Moment, in dem das Match gekippt ist?', a: [
    { t: 'Ja, der verpasste Matchdart. Der wird mich noch lange verfolgen.', tone: 'honest', fx: { mom: -1 } },
    { t: 'Nicht wirklich. Er war über das ganze Match konstanter.', tone: 'humble', fx: { star: -1 } },
    { t: 'Darüber möchte ich jetzt nicht sprechen.', tone: 'evasive', fx: { fans: -1 } },
    { t: 'Als die Halle gegen mich war – das hat mich nur noch mehr angestachelt.', tone: 'fiery', fx: { energy: -5 } }] },
  { q: 'Wie gehst du mit so einer Niederlage um?', a: [
    { t: 'Abhaken, analysieren, weiter trainieren.', tone: 'confident', fx: { manager: 1, sat: -1 } },
    { t: 'Erst mal ein paar Tage mit meiner Familie abschalten.', tone: 'emotional', fx: { partner: 2, manager: -1 } },
    { t: 'Ich werde heute Nacht schlecht schlafen, das ist sicher.', tone: 'honest', fx: { energy: -5 } },
    { t: 'Mit Pizza. Viel Pizza.', tone: 'funny', fx: { sponsors: -1 } }] },
  { q: 'Trotzdem ein starkes Turnier – bist du zufrieden?', a: [
    { t: 'Ja, ich bin stolz, wie weit ich gekommen bin.', tone: 'confident', fx: { fans: 1, mom: -0.5 } },
    { t: 'Zufrieden bin ich erst mit dem Titel.', tone: 'fiery', fx: { sat: -1 } },
    { t: 'Ich nehme die Erfahrung dankbar mit.', tone: 'humble', fx: { sponsors: 1 } },
    { t: 'Fragen Sie mich das morgen noch mal.', tone: 'evasive', fx: { fans: -1 } }] },
  { q: 'Was nimmst du aus diesem Turnier mit?', a: [
    { t: 'Dass ich mit den Besten mithalten kann.', tone: 'confident', fx: { mom: 1, sponsors: -1 } },
    { t: 'Viel Arbeit für die nächsten Wochen.', tone: 'honest', fx: { manager: 1 } },
    { t: 'Ein paar neue Fans und einen leeren Akku.', tone: 'funny', fx: { energy: -5 } },
    { t: 'Die Unterstützung meiner Liebsten – das war unbezahlbar.', tone: 'emotional', fx: { partner: 2, manager: -1 } }] },
  { q: 'Hat dich die große Bühne nervös gemacht?', a: [
    { t: 'Ein bisschen, das gebe ich zu.', tone: 'honest', fx: { mom: -1 } },
    { t: 'Nein, ich habe die Bühne genossen.', tone: 'confident', fx: { fans: 1, star: -1 } },
    { t: 'Ich bin für die große Bühne gemacht – das war nur der Anfang.', tone: 'cocky', fx: { manager: -1 } },
    { t: 'Nervös war höchstens mein Manager.', tone: 'funny', fx: { manager: -1 } }] },
  { q: 'Wie waren die Fans heute zu dir?', a: [
    { t: 'Fantastisch. Danke an alle, die mich angefeuert haben.', tone: 'emotional', fx: { fans: 1, sponsors: -1 } },
    { t: 'Sie waren eher auf seiner Seite. Das muss ich mir erarbeiten.', tone: 'honest', fx: { sat: -1 } },
    { t: 'Ich habe nur auf das Board geschaut.', tone: 'evasive', fx: { fans: -1 } },
    { t: 'Nächstes Jahr singen sie meinen Namen.', tone: 'cocky', fx: { sponsors: 1 } }] },
  { q: 'Was hat am Ende gefehlt?', a: [
    { t: 'Ein, zwei Doppel. Mehr nicht.', tone: 'confident', fx: { mom: 0.5, fans: -1 } },
    { t: 'Die Erfahrung in solchen Momenten.', tone: 'humble', fx: { star: -1 } },
    { t: 'Ein bisschen Glück – und ein besseres Shirt.', tone: 'funny', fx: { sponsors: -1 } },
    { t: 'Das bespreche ich nicht öffentlich.', tone: 'evasive', fx: { fans: -1, manager: 1 } }] },
  { q: 'Wie geht es jetzt für dich weiter?', a: [
    { t: 'Direkt zurück ans Board. Ich will mehr.', tone: 'fiery', fx: { energy: -5, manager: 1 } },
    { t: 'Kurz durchatmen, dann wieder angreifen.', tone: 'confident', fx: { sat: -1 } },
    { t: 'Erst mal ein freies Wochenende mit meiner Freundin.', tone: 'emotional', fx: { partner: 2, manager: -1 } },
    { t: 'Das entscheidet mein Terminkalender, nicht ich.', tone: 'evasive', fx: { fans: -1 } }] },
  { q: 'Ärgerst du dich über einzelne Würfe?', a: [
    { t: 'Natürlich – vor allem über den letzten Pfeil auf die Doppel.', tone: 'honest', fx: { mom: -1 } },
    { t: 'Nein, ich schaue nach vorne.', tone: 'confident', fx: { fans: -1 } },
    { t: 'Ich ärgere mich nur, dass das Board so hart war.', tone: 'funny', fx: { sponsors: -1 } },
    { t: 'Ja, aber das macht mich nur hungriger.', tone: 'fiery', fx: { sat: -1 } }] },
  { q: 'Glaubst du, dass dein großer Titel bald kommt?', a: [
    { t: 'Ganz sicher. Die Frage ist nur wann.', tone: 'cocky', fx: { manager: -1, mom: 1 } },
    { t: 'Ich arbeite jeden Tag daran.', tone: 'humble', fx: { sponsors: 1 } },
    { t: 'Ich denke nicht so weit voraus.', tone: 'evasive', fx: { fans: -1 } },
    { t: 'Der Titel wird kommen – und dann widme ich ihn meiner Familie.', tone: 'emotional', fx: { partner: 1, star: -1 } }] },
  { q: 'War die Niederlage verdient?', a: [
    { t: 'Ja. Er war heute einfach stärker.', tone: 'honest', fx: { mom: -1, fans: 1 } },
    { t: 'Nein. Ich hätte gewinnen müssen.', tone: 'fiery', fx: { sponsors: -1 } },
    { t: 'Verdient ist ein großes Wort.', tone: 'evasive', fx: { fans: -1 } },
    { t: 'Darts ist manchmal gemein – heute zu mir.', tone: 'humble', fx: { star: -1 } }] },
  { q: 'Was sagt dein Team zu deiner Leistung?', a: [
    { t: 'Sie sind stolz, und das bin ich auch.', tone: 'confident', fx: { manager: 1, sat: -1 } },
    { t: 'Die schweigen gerade lieber.', tone: 'funny', fx: { manager: -1 } },
    { t: 'Wir sind uns einig: Da geht noch mehr.', tone: 'honest', fx: { mom: -1 } },
    { t: 'Meine Freundin hat mich schon getröstet.', tone: 'emotional', fx: { partner: 2, sponsors: -1 } }] },
  { q: 'Wie fühlst du dich körperlich nach diesem Turnier?', a: [
    { t: 'Komplett leer. Ich brauche Schlaf.', tone: 'honest', fx: { energy: -5 } },
    { t: 'Topfit – ich könnte gleich noch ein Match spielen.', tone: 'cocky', fx: { fans: 1, sat: -1 } },
    { t: 'Meine Wurfhand braucht jetzt Urlaub.', tone: 'funny', fx: { sponsors: -1 } },
    { t: 'Gut genug, um nächste Woche wieder anzugreifen.', tone: 'confident', fx: { manager: 1, energy: -5 } }] },
  { q: 'Hast du deinem Gegner nach dem Match etwas gesagt?', a: [
    { t: 'Ich habe ihm gratuliert. Das gehört sich so.', tone: 'humble', fx: { sponsors: 1, mom: -0.5 } },
    { t: 'Dass wir uns im nächsten Finale wiedersehen.', tone: 'fiery', fx: { fans: 1, manager: -1 } },
    { t: 'Das bleibt unter uns.', tone: 'evasive', fx: { fans: -1 } },
    { t: 'Dass er mir ein Bier schuldet.', tone: 'funny', fx: { sponsors: -1 } }] },
  { q: 'Was hättest du anders machen sollen?', a: [
    { t: 'Früher Druck machen – ich war zu passiv.', tone: 'honest', fx: { mom: -1 } },
    { t: 'Gar nichts. Ich habe mein Bestes gegeben.', tone: 'confident', fx: { fans: -1 } },
    { t: 'Mehr auf mein Bauchgefühl hören.', tone: 'emotional', fx: { manager: -1 } },
    { t: 'Das weiß ich nach dem Videostudium.', tone: 'evasive', fx: { manager: 1, fans: -1 } }] },
  { q: 'Wie wichtig war dieses Turnier für deine Rangliste?', a: [
    { t: 'Sehr wichtig – das Preisgeld bringt mich ein gutes Stück nach vorne.', tone: 'confident', fx: { sponsors: 1, sat: -1 } },
    { t: 'Ranglisten interessieren mich nicht, ich will Titel.', tone: 'fiery', fx: { manager: -1 } },
    { t: 'Ich schaue da gar nicht so genau hin.', tone: 'evasive', fx: { sponsors: -1 } },
    { t: 'Jeder Punkt zählt. Ich bin dankbar dafür.', tone: 'humble', fx: { star: -1 } }] },
  { q: 'Gibt es ein Dankeschön trotz der Niederlage?', a: [
    { t: 'An meine Familie – ohne sie wäre ich nicht hier.', tone: 'emotional', fx: { partner: 2, sponsors: -1 } },
    { t: 'An meine Sponsoren, die immer an mich glauben.', tone: 'evasive', fx: { sponsors: 2, fans: -1 } },
    { t: 'An die Fans. Ihr seid der Wahnsinn.', tone: 'humble', fx: { fans: 1, manager: -1 } },
    { t: 'An meinen Gegner – dafür, dass er mich noch hungriger gemacht hat.', tone: 'fiery', fx: { mom: 1, sat: -1 } }] },
];
