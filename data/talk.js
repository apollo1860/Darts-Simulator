// New Star Darts: Interview-Fragen (Version 64). Jede Antwort hat einen Ton (intern, wird nicht angezeigt); die Wirkung ergibt sich aus
// Ton + Lage (Ergebnis/Form, Status, Stimmung der Medien) in career.js (`toneEffect`). `fx` = feste Zusatzwirkung dieser Antwort.
// Töne: humble (bescheiden), confident (selbstbewusst), cocky (großspurig), funny (witzig), honest (ehrlich/selbstkritisch),
// evasive (ausweichend), emotional (gefühlvoll), fiery (Kampfansage).
// Version 66: jede Antwort hat ein eigenes Plus/Minus-Profil über alle Bereiche – Fans, Status (star), Sponsoren, Manager, Freundin
// (partner), Selbstvertrauen (mom), Zufriedenheit (sat), Energie (energy, %) und vor der WM die Nervosität (nerves, + = schlechter).
// Typische Gegensätze: Fans ↔ Sponsoren, Manager ↔ Freundin, Status ↔ Zufriedenheit, Fans ↔ Energie, Selbstvertrauen ↔ Nervosität.

// Nach großen Ergebnissen (Titel, Finale/Halbfinale außerhalb der Pro Tour)
import { MORE_RESULT, MORE_IN, MORE_OUT } from './talkmore.js';
const BASE_RESULT = [
  { q: 'Wie fühlt sich dieser Erfolg an?', a: [
    { t: 'Ich bin einfach dankbar, hier sein zu dürfen.', tone: 'humble', fx: { sponsors: -1 } },
    { t: 'Ich habe hart dafür gearbeitet – das ist verdient.', tone: 'confident', fx: { sponsors: 1, sat: -1 } },
    { t: 'Ehrlich? Das war erst der Anfang. Die anderen sollten sich warm anziehen.', tone: 'cocky', fx: { mom: 1, sat: -1 } },
    { t: 'Ich muss gleich meine Mutter anrufen, die weint bestimmt schon.', tone: 'emotional', fx: { partner: -2, sponsors: -1 } }] },
  { q: 'Was war heute der Schlüssel?', a: [
    { t: 'Ein bisschen Glück bei den Doppeln.', tone: 'humble', fx: { mom: -1, fans: 1 } },
    { t: 'Mein Scoring war die ganze Zeit konstant.', tone: 'confident', fx: { star: 1, fans: -2 } },
    { t: 'Ich bin einfach besser als alle hier.', tone: 'cocky', fx: { sponsors: -1 } },
    { t: 'Mein Glücks-Shirt. Das wird nie wieder gewaschen.', tone: 'funny', fx: { sponsors: -2, fans: 1, mom: -0.5 } }] },
  { q: 'Was sagst du zu deinem Gegner?', a: [
    { t: 'Großer Respekt, er hat super gespielt.', tone: 'humble', fx: { sponsors: 1, star: -1 } },
    { t: 'Er hat gut dagegengehalten, aber heute war ich dran.', tone: 'confident', fx: { fans: 1, sat: -1 } },
    { t: 'Er hat vorher große Töne gespuckt – die Antwort gab es am Board.', tone: 'fiery', fx: { fans: 1, energy: -3 } },
    { t: 'Gegner? Ich hab kaum gemerkt, dass jemand da war.', tone: 'cocky', fx: { fans: -1, mom: 1 } }] },
  { q: 'Was sind deine nächsten Ziele?', a: [
    { t: 'Schritt für Schritt, Woche für Woche.', tone: 'evasive', fx: { sat: 1, star: -1 } },
    { t: 'Ich will in die Top 16 – mindestens.', tone: 'confident', fx: { sponsors: 1, sat: -1 } },
    { t: 'Weltmeister. Nächstes Jahr. Schreibt es auf.', tone: 'cocky', fx: { manager: 1, sat: -2 } },
    { t: 'Erst mal an meinen Doppeln arbeiten, die waren heute wacklig.', tone: 'honest', fx: { manager: 1, energy: -5 } }] },
  { q: 'Wie wichtig sind dir die Fans?', a: [
    { t: 'Ohne sie wäre ich nichts.', tone: 'emotional', fx: { fans: 1, sponsors: -1, energy: -3 } },
    { t: 'Die Stimmung hat mich heute getragen.', tone: 'confident', fx: { fans: 1, energy: -4 } },
    { t: 'Die kommen doch wegen mir.', tone: 'cocky', fx: { fans: -1, sponsors: 1 } },
    { t: 'Sehr – vor allem der Typ im Bananenkostüm in Reihe drei.', tone: 'funny', fx: { fans: 1, sponsors: -1, mom: -0.5 } }] },
  { q: 'Wie hast du dich vorbereitet?', a: [
    { t: 'Ganz normal trainiert, nichts Besonderes.', tone: 'evasive', fx: { manager: -1 } },
    { t: 'Viel Training an den Doppeln – das hat sich ausgezahlt.', tone: 'confident', fx: { manager: 1, partner: -1, sat: -1 } },
    { t: 'Vorbereitung? Talent reicht.', tone: 'cocky', fx: { manager: -1, fans: 1 } },
    { t: 'Mit sehr viel Kaffee und sehr wenig Schlaf.', tone: 'funny', fx: { manager: -1, partner: -1, energy: -5 } }] },
  { q: 'Gab es einen Moment, in dem du gezweifelt hast?', a: [
    { t: 'Ja, nach dem verlorenen Leg war ich kurz raus. Das muss besser werden.', tone: 'honest', fx: { fans: 1 } },
    { t: 'Nein. Ich wusste, dass ich zurückkomme.', tone: 'confident', fx: { mom: 0.5, sat: -1 } },
    { t: 'Zweifel kenne ich nicht.', tone: 'cocky', fx: { partner: -1 } },
    { t: 'Nur als mein Bier alle war.', tone: 'funny', fx: { sponsors: 1, manager: -1, energy: -3 } }] },
  { q: 'Was machst du mit dem Preisgeld?', a: [
    { t: 'Meiner Familie etwas zurückgeben.', tone: 'emotional', fx: { partner: 1, manager: -1, fans: 1 } },
    { t: 'Erst mal eine Runde für alle!', tone: 'funny', fx: { sat: 1, fans: 2, energy: -6, manager: -1 } },
    { t: 'Noch ein Auto. Oder zwei.', tone: 'cocky', fx: { partner: 2, manager: -1, fans: -2 } },
    { t: 'Sparen. Ganz langweilig.', tone: 'evasive', fx: { manager: 1, partner: -1, sponsors: 1 } }] },
  { q: 'Wie war die Stimmung in der Halle?', a: [
    { t: 'Gänsehaut. So etwas vergisst man nie.', tone: 'emotional', fx: { fans: 1, energy: -4 } },
    { t: 'Laut – und genau so mag ich es.', tone: 'confident', fx: { fans: 1, sat: -1 } },
    { t: 'Ich habe mich nur auf das Board konzentriert.', tone: 'evasive', fx: { mom: 0.5, fans: -1 } },
    { t: 'Ein paar haben gepfiffen – die singen nächstes Mal für mich.', tone: 'fiery', fx: { fans: -1, mom: 0.5 } }] },
  { q: 'Wer hat dich auf dem Weg hierher am meisten unterstützt?', a: [
    { t: 'Mein Manager – ohne ihn stünde ich nicht hier.', tone: 'humble', fx: { manager: 2, partner: -3, sponsors: 1 } },
    { t: 'Meine Familie und meine Freundin.', tone: 'emotional', fx: { partner: 2, manager: -2 } },
    { t: 'Ich mir selbst. Sonst niemand.', tone: 'cocky', fx: { manager: -1, partner: -2, mom: 1 } },
    { t: 'Meine Sponsoren – und ihr Kühlschrank.', tone: 'funny', fx: { sponsors: 1, fans: 1, energy: -3 } }] },
];

// Elmar Paulke vor der WM – du bist dabei
const BASE_IN = [
  { q: 'Weltmeisterschaft im Ally Pally – was geht dir durch den Kopf, wenn du an die Bühne denkst?', a: [
    { t: 'Ehrfurcht. Ich will einfach jedes Match genießen.', tone: 'humble', fx: { nerves: -0.3, star: -1 } },
    { t: 'Vorfreude. Ich bin bereit für die große Bühne.', tone: 'confident', fx: { sat: -1, nerves: 0.1 } },
    { t: 'Die Bühne muss sich an mich gewöhnen, nicht umgekehrt.', tone: 'cocky', fx: { fans: 1, nerves: 0.3 } },
    { t: 'Vor allem, ob die Hose für den Walk-on noch passt.', tone: 'funny', fx: { fans: 1, sponsors: -1, mom: -0.5 } }] },
  { q: 'Wer ist für dich der Topfavorit auf den Titel?', a: [
    { t: 'Luke Littler, ganz klar. Ich bin Außenseiter.', tone: 'humble', fx: { nerves: -0.4, fans: -1 } },
    { t: 'Die üblichen Verdächtigen – aber rechnet mit mir.', tone: 'confident', fx: { sponsors: 1, sat: -1 } },
    { t: 'Der steht gerade vor dir, Elmar.', tone: 'cocky', fx: { fans: 2, nerves: 0.4 } },
    { t: 'Favoriten interessieren mich nicht, ich schaue nur auf mein erstes Match.', tone: 'evasive', fx: { mom: 0.5, star: -1 } }] },
  { q: 'Wie ist deine Form vor dem Turnier?', a: [
    { t: 'Ehrlich gesagt wacklig – die Doppel sitzen nicht wie gewünscht.', tone: 'honest', fx: { fans: 1, nerves: -0.3 } },
    { t: 'Im Training läuft es richtig gut.', tone: 'confident', fx: { mom: 0.5, nerves: 0.2, sat: -1 } },
    { t: 'Form ist Tagesform. Wir werden sehen.', tone: 'evasive', fx: { sponsors: -1, energy: 3 } },
    { t: 'Gut genug, um jedem hier wehzutun.', tone: 'fiery', fx: { fans: 1, sponsors: -1 } }] },
  { q: 'Was bedeutet dir die WM persönlich?', a: [
    { t: 'Alles. Ich denke an meine Familie, die mich immer unterstützt hat.', tone: 'emotional', fx: { partner: 1 } },
    { t: 'Ein Traum, der wahr wird.', tone: 'humble', fx: { fans: 1, star: -1 } },
    { t: 'Ein weiterer Titel für meine Vitrine.', tone: 'cocky', fx: { fans: -1, sponsors: 1 } },
    { t: 'Weihnachten im Ally Pally statt unterm Baum – meine Oma ist immer noch sauer.', tone: 'funny', fx: { partner: -2, manager: 1, fans: 1, mom: -0.5 } }] },
  { q: 'Was ist dein Ziel für dieses Turnier?', a: [
    { t: 'Die erste Runde überstehen, dann sehen wir weiter.', tone: 'humble', fx: { nerves: -0.4, sponsors: -1 } },
    { t: 'Ich will mindestens ins Viertelfinale.', tone: 'confident', fx: { manager: 1, nerves: 0.2, sat: -1 } },
    { t: 'Den Sid-Waddell-Pokal in die Luft stemmen. Was sonst?', tone: 'cocky', fx: { fans: 1, nerves: 0.5 } },
    { t: 'Ohne Druck spielen – letztes Mal hat mich der Kopf gebremst.', tone: 'honest', fx: { nerves: -0.4, star: -1 } }] },
  { q: 'Wie gehst du mit dem Lärm und dem Druck im Ally Pally um?', a: [
    { t: 'Ohrstöpsel und ein gutes Stoßgebet.', tone: 'funny', fx: { nerves: -0.2, sponsors: -1, mom: -0.5 } },
    { t: 'Der Lärm pusht mich.', tone: 'confident', fx: { mom: 0.5, nerves: 0.2, sat: -1 } },
    { t: 'Das ist noch meine größte Baustelle.', tone: 'honest', fx: { fans: 1, mom: -0.5, nerves: 0.2 } },
    { t: 'Ich denke an die Fans, die extra für mich anreisen.', tone: 'emotional', fx: { fans: 2, energy: -3 } }] },
  { q: 'Die Sätze-Formate sind lang – wie wichtig ist die Fitness?', a: [
    { t: 'Ich habe gezielt an meiner Ausdauer gearbeitet.', tone: 'confident', fx: { manager: 1, energy: 4, sat: -1 } },
    { t: 'Darts ist Kopfsache, nicht Fitness.', tone: 'evasive', fx: { mom: 0.5, energy: -4 } },
    { t: 'Ich habe extra die Treppe zum Hotel genommen. Einmal.', tone: 'funny', fx: { fans: 1, manager: -1, mom: -0.5 } },
    { t: 'Ich merke schon, dass ich nach langen Matches nachlasse.', tone: 'honest', fx: { manager: 1, mom: -0.5 } }] },
  { q: 'Was sagst du den Kritikern, die dich nicht auf der Rechnung haben?', a: [
    { t: 'Die sollen gut zuhören – nach dem Turnier reden wir weiter.', tone: 'fiery', fx: { fans: 1, nerves: 0.2 } },
    { t: 'Die haben recht, ich muss mich erst beweisen.', tone: 'humble', fx: { nerves: -0.3, fans: 1 } },
    { t: 'Ich lese keine Kommentare.', tone: 'evasive', fx: { sat: 1, fans: -1 } },
    { t: 'Kritiker haben noch nie einen Pfeil geworfen.', tone: 'cocky', fx: { fans: -1, mom: 1 } }] },
  { q: 'Wie verbringst du die Tage vor deinem ersten Match?', a: [
    { t: 'Mit meinen Liebsten – das gibt mir Ruhe.', tone: 'emotional', fx: { partner: 1, manager: -1, energy: 4 } },
    { t: 'Training, Schlaf, Fokus. Nichts dem Zufall überlassen.', tone: 'confident', fx: { manager: 2, partner: -2, energy: 3, sat: -1 } },
    { t: 'Ich teste alle Pubs in Nord-London. Für die Wissenschaft.', tone: 'funny', fx: { sat: 1, manager: -2, partner: -1, fans: 2, energy: -8 } },
    { t: 'Ganz normal, nichts Besonderes.', tone: 'evasive', fx: { energy: 2, fans: -1 } }] },
  { q: 'Hast du eine Botschaft an deine Sponsoren?', a: [
    { t: 'Danke für das Vertrauen – ich zahle es auf der Bühne zurück.', tone: 'confident', fx: { sponsors: 1, fans: -2 } },
    { t: 'Mein Trikot sieht im Fernsehen besser aus als ich.', tone: 'funny', fx: { fans: 1, sponsors: -1, mom: -0.5 } },
    { t: 'Ich spiele für mich, nicht für Logos.', tone: 'honest', fx: { sponsors: -2, fans: 2 } },
    { t: 'Ohne sie könnte ich mir das hier gar nicht leisten.', tone: 'humble', fx: { sponsors: 1, fans: -1 } }] },
  { q: 'Gegen wen möchtest du auf keinen Fall früh spielen?', a: [
    { t: 'Gegen Littler. Der ist im Moment eine Klasse für sich.', tone: 'honest', fx: { nerves: -0.3, fans: 1 } },
    { t: 'Mir egal. Wer kommt, kommt.', tone: 'confident', fx: { mom: 0.5, sat: -1 } },
    { t: 'Die sollten eher Angst haben, gegen mich zu spielen.', tone: 'fiery', fx: { fans: 1, nerves: 0.3 } },
    { t: 'Gegen meinen Zahnarzt. Der will noch Geld von mir.', tone: 'funny', fx: { fans: 1, sponsors: -1, mom: -0.5 } }] },
];

// Elmar Paulke vor der WM – du bist nicht qualifiziert
const BASE_OUT = [
  { q: 'Du bist bei der WM nicht dabei – wie sehr schmerzt das?', a: [
    { t: 'Sehr. Ich habe mir viel mehr vorgenommen.', tone: 'honest', fx: { fans: 1, mom: -0.5 } },
    { t: 'Das gehört dazu, es gibt Wichtigeres.', tone: 'evasive', fx: { sat: 1, fans: -1 } },
    { t: 'Nächstes Jahr komme ich zurück – und dann bin ich gefährlich.', tone: 'fiery', fx: { mom: 0.5, manager: 1 } },
    { t: 'Dafür habe ich zum ersten Mal ein ruhiges Weihnachten.', tone: 'funny', fx: { partner: 2, manager: -1, sat: 1, mom: -0.5 } }] },
  { q: 'Was nimmst du aus dieser Saison mit?', a: [
    { t: 'Dass ich auf diesem Niveau mithalten kann.', tone: 'confident', fx: { mom: 0.5, sat: -1 } },
    { t: 'Viel Demut. Die Tour ist brutal.', tone: 'humble', fx: { sponsors: -1, sat: 1 } },
    { t: 'Die Fans, die trotzdem zu mir gehalten haben.', tone: 'emotional', fx: { fans: 2, manager: -1 } },
    { t: 'Eigentlich war ich besser als die Ergebnisse. Pech.', tone: 'cocky', fx: { fans: -1, mom: 1 } }] },
  { q: 'Wem drückst du bei der WM die Daumen?', a: [
    { t: 'Den Deutschen natürlich – ich fiebere mit.', tone: 'emotional', fx: { fans: 1 } },
    { t: 'Dem, der gegen Littler spielt.', tone: 'funny', fx: { fans: 2, sponsors: -1, mom: -0.5 } },
    { t: 'Keinem. Ich will da selbst stehen.', tone: 'fiery', fx: { mom: 0.5, fans: -1 } },
    { t: 'Ich schaue mir das ganz neutral an.', tone: 'evasive', fx: { sat: 1, star: -1 } }] },
  { q: 'Was willst du im nächsten Jahr ändern?', a: [
    { t: 'Alles auf den Prüfstand stellen – Training, Darts, Einstellung.', tone: 'honest', fx: { manager: 2, partner: -2, energy: -5, mom: 0.5 } },
    { t: 'Nicht viel. Der Weg stimmt, die Ergebnisse kommen.', tone: 'confident', fx: { mom: 0.5, manager: -1, sat: -1 } },
    { t: 'Mehr Zeit für Familie und Kopf, weniger Stress.', tone: 'emotional', fx: { partner: 2, manager: -2, sponsors: -1, energy: 5 } },
    { t: 'Den Manager. Kleiner Scherz. Oder?', tone: 'funny', fx: { manager: -2, partner: 1, fans: 1, mom: -0.5 } }] },
  { q: 'Wie gehst du mit der Kritik nach so einem Jahr um?', a: [
    { t: 'Ich nehme sie an – sie ist ja berechtigt.', tone: 'humble', fx: { mom: -0.5, fans: 1 } },
    { t: 'Ich lese so etwas gar nicht erst.', tone: 'evasive', fx: { sat: 1, fans: -1 } },
    { t: 'Die Kritiker werden sich nächstes Jahr wundern.', tone: 'fiery', fx: { fans: 1 } },
    { t: 'Kritik von Leuten, die nie gespielt haben, interessiert mich nicht.', tone: 'cocky', fx: { fans: -1, mom: 1 } }] },
  { q: 'Wirst du dir die WM im Fernsehen anschauen?', a: [
    { t: 'Natürlich, jedes Match – ich will lernen.', tone: 'humble', fx: { manager: 1, partner: -1, energy: -3 } },
    { t: 'Nur mit Chips und Glühwein – auf der Couch mit meiner Freundin.', tone: 'funny', fx: { sat: 1, partner: 2, manager: -1, energy: 4, mom: -0.5 } },
    { t: 'Nein. Das tut zu weh.', tone: 'honest', fx: { fans: 1, sat: -2 } },
    { t: 'Ich trainiere lieber – während die anderen spielen.', tone: 'confident', fx: { manager: 2, partner: -2, energy: -5, mom: 0.5 } }] },
];

// Version 67: Pools auf 50 / 30 / 25 Fragen erweitert (data/talkmore.js)
export const RESULT_QS = [...BASE_RESULT, ...MORE_RESULT];
export const PAULKE_IN = [...BASE_IN, ...MORE_IN];
export const PAULKE_OUT = [...BASE_OUT, ...MORE_OUT];

// Einleitung je Stimmung (−1 kritisch, 0 normal, +1 heiter) – der einzige Hinweis, wie Witz und große Töne ankommen
export const MOOD_INTRO = {
  paulke: {
    '1': 'Elmar Paulke begrüßt dich bestens gelaunt – die Vorfreude auf die WM ist überall zu spüren.',
    '0': 'Elmar Paulke rückt das Mikrofon zurecht. Ein ganz normales Gespräch vor der WM.',
    '-1': 'Elmar Paulke wirkt heute angriffslustig – die Medien sind gerade kritisch gestimmt.',
  },
  result: {
    '1': 'Die Halle feiert noch – die Reporter sind bester Laune.',
    '0': 'Ein Reporter wartet am Bühnenrand auf dich.',
    '-1': 'Die Journalisten sind heute kritisch – kein leichtes Publikum.',
  },
  loss: {                                                   // Version 125: nach verlorenem Finale/Halbfinale
    '1': 'Trotz der Niederlage applaudiert die Halle – die Reporter sind dir wohlgesonnen.',
    '0': 'Ein Reporter fängt dich nach der Niederlage am Bühnenrand ab.',
    '-1': 'Die Journalisten wittern nach der Niederlage eine Geschichte – kein leichtes Gespräch.',
  },
};
