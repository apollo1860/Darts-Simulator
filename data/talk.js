// New Star Darts: Interview-Fragen (Version 64). Jede Antwort hat einen Ton (intern, wird nicht angezeigt); die Wirkung ergibt sich aus
// Ton + Lage (Ergebnis/Form, Status, Stimmung der Medien) in career.js (`toneEffect`). `fx` = feste Zusatzwirkung dieser Antwort.
// Töne: humble (bescheiden), confident (selbstbewusst), cocky (großspurig), funny (witzig), honest (ehrlich/selbstkritisch),
// evasive (ausweichend), emotional (gefühlvoll), fiery (Kampfansage).
// Version 65: Achse Karriere ↔ Privatleben – viele Antworten freuen den Manager und ärgern die Freundin oder umgekehrt (Ton + `fx`).

// Nach großen Ergebnissen (Titel, Finale/Halbfinale außerhalb der Pro Tour)
export const RESULT_QS = [
  { q: 'Wie fühlt sich dieser Erfolg an?', a: [
    { t: 'Ich bin einfach dankbar, hier sein zu dürfen.', tone: 'humble' },
    { t: 'Ich habe hart dafür gearbeitet – das ist verdient.', tone: 'confident' },
    { t: 'Ehrlich? Das war erst der Anfang. Die anderen sollten sich warm anziehen.', tone: 'cocky' },
    { t: 'Ich muss gleich meine Mutter anrufen, die weint bestimmt schon.', tone: 'emotional', fx: { partner: -2 } }] },
  { q: 'Was war heute der Schlüssel?', a: [
    { t: 'Ein bisschen Glück bei den Doppeln.', tone: 'humble' },
    { t: 'Mein Scoring war die ganze Zeit konstant.', tone: 'confident' },
    { t: 'Ich bin einfach besser als alle hier.', tone: 'cocky' },
    { t: 'Mein Glücks-Shirt. Das wird nie wieder gewaschen.', tone: 'funny' }] },
  { q: 'Was sagst du zu deinem Gegner?', a: [
    { t: 'Großer Respekt, er hat super gespielt.', tone: 'humble' },
    { t: 'Er hat gut dagegengehalten, aber heute war ich dran.', tone: 'confident' },
    { t: 'Er hat vorher große Töne gespuckt – die Antwort gab es am Board.', tone: 'fiery' },
    { t: 'Gegner? Ich hab kaum gemerkt, dass jemand da war.', tone: 'cocky' }] },
  { q: 'Was sind deine nächsten Ziele?', a: [
    { t: 'Schritt für Schritt, Woche für Woche.', tone: 'evasive' },
    { t: 'Ich will in die Top 16 – mindestens.', tone: 'confident' },
    { t: 'Weltmeister. Nächstes Jahr. Schreibt es auf.', tone: 'cocky' },
    { t: 'Erst mal an meinen Doppeln arbeiten, die waren heute wacklig.', tone: 'honest' }] },
  { q: 'Wie wichtig sind dir die Fans?', a: [
    { t: 'Ohne sie wäre ich nichts.', tone: 'emotional' },
    { t: 'Die Stimmung hat mich heute getragen.', tone: 'confident' },
    { t: 'Die kommen doch wegen mir.', tone: 'cocky' },
    { t: 'Sehr – vor allem der Typ im Bananenkostüm in Reihe drei.', tone: 'funny' }] },
  { q: 'Wie hast du dich vorbereitet?', a: [
    { t: 'Ganz normal trainiert, nichts Besonderes.', tone: 'evasive' },
    { t: 'Viel Training an den Doppeln – das hat sich ausgezahlt.', tone: 'confident', fx: { manager: 1, partner: -1 } },
    { t: 'Vorbereitung? Talent reicht.', tone: 'cocky' },
    { t: 'Mit sehr viel Kaffee und sehr wenig Schlaf.', tone: 'funny', fx: { manager: -1, partner: -1 } }] },
  { q: 'Gab es einen Moment, in dem du gezweifelt hast?', a: [
    { t: 'Ja, nach dem verlorenen Leg war ich kurz raus. Das muss besser werden.', tone: 'honest' },
    { t: 'Nein. Ich wusste, dass ich zurückkomme.', tone: 'confident' },
    { t: 'Zweifel kenne ich nicht.', tone: 'cocky' },
    { t: 'Nur als mein Bier alle war.', tone: 'funny' }] },
  { q: 'Was machst du mit dem Preisgeld?', a: [
    { t: 'Meiner Familie etwas zurückgeben.', tone: 'emotional', fx: { partner: 1, manager: -1 } },
    { t: 'Erst mal eine Runde für alle!', tone: 'funny', fx: { sat: 1 } },
    { t: 'Noch ein Auto. Oder zwei.', tone: 'cocky', fx: { partner: 2, manager: -1 } },
    { t: 'Sparen. Ganz langweilig.', tone: 'evasive', fx: { manager: 1, partner: -1 } }] },
  { q: 'Wie war die Stimmung in der Halle?', a: [
    { t: 'Gänsehaut. So etwas vergisst man nie.', tone: 'emotional' },
    { t: 'Laut – und genau so mag ich es.', tone: 'confident' },
    { t: 'Ich habe mich nur auf das Board konzentriert.', tone: 'evasive' },
    { t: 'Ein paar haben gepfiffen – die singen nächstes Mal für mich.', tone: 'fiery' }] },
  { q: 'Wer hat dich auf dem Weg hierher am meisten unterstützt?', a: [
    { t: 'Mein Manager – ohne ihn stünde ich nicht hier.', tone: 'humble', fx: { manager: 2, partner: -3 } },
    { t: 'Meine Familie und meine Freundin.', tone: 'emotional', fx: { partner: 2, manager: -2 } },
    { t: 'Ich mir selbst. Sonst niemand.', tone: 'cocky', fx: { manager: -1, partner: -2 } },
    { t: 'Meine Sponsoren – und ihr Kühlschrank.', tone: 'funny', fx: { sponsors: 1 } }] },
];

// Elmar Paulke vor der WM – du bist dabei
export const PAULKE_IN = [
  { q: 'Weltmeisterschaft im Ally Pally – was geht dir durch den Kopf, wenn du an die Bühne denkst?', a: [
    { t: 'Ehrfurcht. Ich will einfach jedes Match genießen.', tone: 'humble' },
    { t: 'Vorfreude. Ich bin bereit für die große Bühne.', tone: 'confident' },
    { t: 'Die Bühne muss sich an mich gewöhnen, nicht umgekehrt.', tone: 'cocky' },
    { t: 'Vor allem, ob die Hose für den Walk-on noch passt.', tone: 'funny' }] },
  { q: 'Wer ist für dich der Topfavorit auf den Titel?', a: [
    { t: 'Luke Littler, ganz klar. Ich bin Außenseiter.', tone: 'humble' },
    { t: 'Die üblichen Verdächtigen – aber rechnet mit mir.', tone: 'confident' },
    { t: 'Der steht gerade vor dir, Elmar.', tone: 'cocky' },
    { t: 'Favoriten interessieren mich nicht, ich schaue nur auf mein erstes Match.', tone: 'evasive' }] },
  { q: 'Wie ist deine Form vor dem Turnier?', a: [
    { t: 'Ehrlich gesagt wacklig – die Doppel sitzen nicht wie gewünscht.', tone: 'honest' },
    { t: 'Im Training läuft es richtig gut.', tone: 'confident' },
    { t: 'Form ist Tagesform. Wir werden sehen.', tone: 'evasive' },
    { t: 'Gut genug, um jedem hier wehzutun.', tone: 'fiery' }] },
  { q: 'Was bedeutet dir die WM persönlich?', a: [
    { t: 'Alles. Ich denke an meine Familie, die mich immer unterstützt hat.', tone: 'emotional' },
    { t: 'Ein Traum, der wahr wird.', tone: 'humble' },
    { t: 'Ein weiterer Titel für meine Vitrine.', tone: 'cocky' },
    { t: 'Weihnachten im Ally Pally statt unterm Baum – meine Oma ist immer noch sauer.', tone: 'funny', fx: { partner: -2, manager: 1 } }] },
  { q: 'Was ist dein Ziel für dieses Turnier?', a: [
    { t: 'Die erste Runde überstehen, dann sehen wir weiter.', tone: 'humble' },
    { t: 'Ich will mindestens ins Viertelfinale.', tone: 'confident' },
    { t: 'Den Sid-Waddell-Pokal in die Luft stemmen. Was sonst?', tone: 'cocky' },
    { t: 'Ohne Druck spielen – letztes Mal hat mich der Kopf gebremst.', tone: 'honest' }] },
  { q: 'Wie gehst du mit dem Lärm und dem Druck im Ally Pally um?', a: [
    { t: 'Ohrstöpsel und ein gutes Stoßgebet.', tone: 'funny' },
    { t: 'Der Lärm pusht mich.', tone: 'confident' },
    { t: 'Das ist noch meine größte Baustelle.', tone: 'honest' },
    { t: 'Ich denke an die Fans, die extra für mich anreisen.', tone: 'emotional' }] },
  { q: 'Die Sätze-Formate sind lang – wie wichtig ist die Fitness?', a: [
    { t: 'Ich habe gezielt an meiner Ausdauer gearbeitet.', tone: 'confident', fx: { manager: 1 } },
    { t: 'Darts ist Kopfsache, nicht Fitness.', tone: 'evasive' },
    { t: 'Ich habe extra die Treppe zum Hotel genommen. Einmal.', tone: 'funny' },
    { t: 'Ich merke schon, dass ich nach langen Matches nachlasse.', tone: 'honest' }] },
  { q: 'Was sagst du den Kritikern, die dich nicht auf der Rechnung haben?', a: [
    { t: 'Die sollen gut zuhören – nach dem Turnier reden wir weiter.', tone: 'fiery' },
    { t: 'Die haben recht, ich muss mich erst beweisen.', tone: 'humble' },
    { t: 'Ich lese keine Kommentare.', tone: 'evasive' },
    { t: 'Kritiker haben noch nie einen Pfeil geworfen.', tone: 'cocky' }] },
  { q: 'Wie verbringst du die Tage vor deinem ersten Match?', a: [
    { t: 'Mit meinen Liebsten – das gibt mir Ruhe.', tone: 'emotional', fx: { partner: 1, manager: -1 } },
    { t: 'Training, Schlaf, Fokus. Nichts dem Zufall überlassen.', tone: 'confident', fx: { manager: 2, partner: -2 } },
    { t: 'Ich teste alle Pubs in Nord-London. Für die Wissenschaft.', tone: 'funny', fx: { sat: 1, manager: -2, partner: -1 } },
    { t: 'Ganz normal, nichts Besonderes.', tone: 'evasive' }] },
  { q: 'Hast du eine Botschaft an deine Sponsoren?', a: [
    { t: 'Danke für das Vertrauen – ich zahle es auf der Bühne zurück.', tone: 'confident', fx: { sponsors: 1 } },
    { t: 'Mein Trikot sieht im Fernsehen besser aus als ich.', tone: 'funny' },
    { t: 'Ich spiele für mich, nicht für Logos.', tone: 'honest', fx: { sponsors: -2 } },
    { t: 'Ohne sie könnte ich mir das hier gar nicht leisten.', tone: 'humble', fx: { sponsors: 1 } }] },
  { q: 'Gegen wen möchtest du auf keinen Fall früh spielen?', a: [
    { t: 'Gegen Littler. Der ist im Moment eine Klasse für sich.', tone: 'honest' },
    { t: 'Mir egal. Wer kommt, kommt.', tone: 'confident' },
    { t: 'Die sollten eher Angst haben, gegen mich zu spielen.', tone: 'fiery' },
    { t: 'Gegen meinen Zahnarzt. Der will noch Geld von mir.', tone: 'funny' }] },
];

// Elmar Paulke vor der WM – du bist nicht qualifiziert
export const PAULKE_OUT = [
  { q: 'Du bist bei der WM nicht dabei – wie sehr schmerzt das?', a: [
    { t: 'Sehr. Ich habe mir viel mehr vorgenommen.', tone: 'honest' },
    { t: 'Das gehört dazu, es gibt Wichtigeres.', tone: 'evasive' },
    { t: 'Nächstes Jahr komme ich zurück – und dann bin ich gefährlich.', tone: 'fiery' },
    { t: 'Dafür habe ich zum ersten Mal ein ruhiges Weihnachten.', tone: 'funny', fx: { partner: 2, manager: -1 } }] },
  { q: 'Was nimmst du aus dieser Saison mit?', a: [
    { t: 'Dass ich auf diesem Niveau mithalten kann.', tone: 'confident' },
    { t: 'Viel Demut. Die Tour ist brutal.', tone: 'humble' },
    { t: 'Die Fans, die trotzdem zu mir gehalten haben.', tone: 'emotional' },
    { t: 'Eigentlich war ich besser als die Ergebnisse. Pech.', tone: 'cocky' }] },
  { q: 'Wem drückst du bei der WM die Daumen?', a: [
    { t: 'Den Deutschen natürlich – ich fiebere mit.', tone: 'emotional' },
    { t: 'Dem, der gegen Littler spielt.', tone: 'funny' },
    { t: 'Keinem. Ich will da selbst stehen.', tone: 'fiery' },
    { t: 'Ich schaue mir das ganz neutral an.', tone: 'evasive' }] },
  { q: 'Was willst du im nächsten Jahr ändern?', a: [
    { t: 'Alles auf den Prüfstand stellen – Training, Darts, Einstellung.', tone: 'honest', fx: { manager: 2, partner: -2 } },
    { t: 'Nicht viel. Der Weg stimmt, die Ergebnisse kommen.', tone: 'confident' },
    { t: 'Mehr Zeit für Familie und Kopf, weniger Stress.', tone: 'emotional', fx: { partner: 2, manager: -2 } },
    { t: 'Den Manager. Kleiner Scherz. Oder?', tone: 'funny', fx: { manager: -2, partner: 1 } }] },
  { q: 'Wie gehst du mit der Kritik nach so einem Jahr um?', a: [
    { t: 'Ich nehme sie an – sie ist ja berechtigt.', tone: 'humble' },
    { t: 'Ich lese so etwas gar nicht erst.', tone: 'evasive' },
    { t: 'Die Kritiker werden sich nächstes Jahr wundern.', tone: 'fiery' },
    { t: 'Kritik von Leuten, die nie gespielt haben, interessiert mich nicht.', tone: 'cocky' }] },
  { q: 'Wirst du dir die WM im Fernsehen anschauen?', a: [
    { t: 'Natürlich, jedes Match – ich will lernen.', tone: 'humble', fx: { manager: 1, partner: -1 } },
    { t: 'Nur mit Chips und Glühwein – auf der Couch mit meiner Freundin.', tone: 'funny', fx: { sat: 1, partner: 2, manager: -1 } },
    { t: 'Nein. Das tut zu weh.', tone: 'honest' },
    { t: 'Ich trainiere lieber – während die anderen spielen.', tone: 'confident', fx: { manager: 2, partner: -2 } }] },
];

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
};
