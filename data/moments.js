// New Star Darts: Spielmomente (Version 68) – kleine Zwischenfälle im DartConnect-Liveticker, ca. alle 1–2 eigene Matches.
// Zwei Optionen, jede mit gleicher Chance (50/50) auf einen guten oder schlechten Ausgang – es gibt keine „richtige“ Antwort.
// Ausgang: s = [Streuungs-Multiplikator, Aufnahmen] für dich (< 1 besser, > 1 schlechter), o = dasselbe für den Gegner,
// fx = dauerhafte Nebenwirkung (fans = Medienpräsenz, manager/sponsors = Professionalität, sat, mom = Selbstvertrauen, energy in %).
// Ausgewogen: Gewinn und Verlust jeder Option heben sich im Erwartungswert ungefähr auf (Test v68). {opp} = Nachname des Gegners.
const R = (t, s, o, fx) => ({ t, ...(s ? { s } : {}), ...(o ? { o } : {}), ...(fx ? { fx } : {}) });
const O = (label, win, lose) => ({ label, win, lose });

export const MOMENTS = [
  { id: 'slippery', icon: '🎯', title: 'Rutschiger Dart', text: 'Der Dart liegt heute nicht so fest in der Hand wie sonst.', options: [
    O('Griff anpassen und werfen', R('Der neue Griff sitzt – die Pfeile fliegen wie am Schnürchen.', [0.9, 3]), R('Der Griff fühlt sich fremd an, die Darts streuen.', [1.12, 3])),
    O('Kurz die Hand trocknen', R('Handtuch, Atmen, neu ansetzen – wieder voll im Rhythmus.', [0.82, 4], null, { fans: 1 }), R('Die Pause wirft dich raus, der Rhythmus ist weg.', [1.2, 4], null, { sponsors: -1 }))] },
  { id: 'flight', icon: '🪶', title: 'Flight sitzt locker', text: 'Beim Herausziehen merkst du: Der Flight wackelt.', options: [
    O('Schnell festdrehen', R('Fest und sauber – der Dart fliegt wieder gerade.', [0.9, 3]), R('Zu fest angezogen, der Dart liegt komisch in der Hand.', [1.12, 3])),
    O('Den Flight tauschen', R('Der frische Flight macht den Unterschied.', [0.82, 4]), R('Der Ersatz hat eine andere Form – ungewohnt.', [1.2, 4], null, { mom: -1 }))] },
  { id: 'barrel', icon: '🔩', title: 'Barrel lockert sich', text: 'Das Gewinde zwischen Barrel und Schaft gibt nach.', options: [
    O('Mit dem Daumennagel nachziehen', R('Kurzer Dreh, und alles sitzt wieder.', [0.9, 3]), R('Du hast dich verschätzt – der Dart schwingt anders.', [1.12, 3])),
    O('Ersatz-Darts nehmen', R('Das Ersatzset fühlt sich überraschend gut an.', [0.82, 4], null, { mom: 1 }), R('Das Ersatzset ist ungewohnt schwer.', [1.2, 4]))] },
  { id: 'heckler', icon: '📣', title: 'Zwischenruf', text: 'Aus dem Publikum ruft jemand mitten in dein Anspielen.', options: [
    O('Ignorieren', R('Du hörst nicht hin, der Wurf sitzt.', [0.9, 2]), R('Der Ruf hängt dir noch im Kopf nach.', [1.12, 2])),
    O('Zurückgrinsen und winken', R('Die Halle lacht mit dir – Rückenwind!', [0.82, 3], null, { fans: 1 }), R('Der Gag kommt nicht an – wirkt unprofessionell.', [1.2, 3], null, { sponsors: -1 }))] },
  { id: 'slow', icon: '⏳', title: '{opp} lässt sich Zeit', text: '{opp} schindet auffällig viel Zeit zwischen den Darts.', options: [
    O('Cool bleiben, Schultern lockern', R('Du bleibst im Tunnel – {opp} verhaspelt sich eher selbst.', [0.9, 3], [1.1, 2]), R('Das Warten zerrt an den Nerven.', [1.12, 3])),
    O('Beim Schiedsrichter beschweren', R('Der Referee mahnt {opp} – er ist raus aus seinem Rhythmus.', null, [1.2, 3]), R('Der Referee winkt ab, du hast dich nur geärgert.', [1.2, 3], null, { manager: -1 }))] },
  { id: 'glare', icon: '💡', title: 'Blendendes Licht', text: 'Ein Scheinwerfer blendet dich genau beim Anvisieren.', options: [
    O('Blinzeln und weiterwerfen', R('Du findest das Ziel auch halb blind.', [0.9, 2]), R('Der Dart landet daneben.', [1.12, 3])),
    O('Um eine Pause bitten', R('Das Licht wird gedimmt – frischer Blick.', [0.84, 3]), R('Die Pause nimmt Schwung, danach zittern die Hände.', [1.2, 3], null, { fans: -1 }))] },
  { id: 'flash', icon: '📸', title: 'Kamerablitz', text: 'Ein Fotograf blitzt aus der ersten Reihe.', options: [
    O('Nicht beachten', R('Du merkst es kaum – volle Konzentration.', [0.9, 2]), R('Das Blitzlicht hallt nach, du siehst Sterne.', [1.12, 3])),
    O('Kurz in die Kamera lächeln', R('Das Foto geht durch die sozialen Medien – super Image!', [0.86, 3], null, { fans: 2 }), R('Auf dem Bild siehst du aus wie ein Reh im Scheinwerferlicht.', [1.18, 3], null, { fans: -1 }))] },
  { id: 'cramp', icon: '💪', title: 'Ziehen im Wurfarm', text: 'Im Unterarm zieht es leicht – ausgerechnet jetzt.', options: [
    O('Ausschütteln und weiter', R('Der Krampf löst sich, der Arm fühlt sich locker an.', [0.9, 3]), R('Es zwickt weiter und der Wurf fühlt sich komisch an.', [1.12, 3], null, { energy: -2 })),
    O('Kurz dehnen', R('Eine Streckung, ein tiefer Atemzug – wie neugeboren.', [0.82, 4], null, { energy: 2 }), R('Beim Dehnen verhärtet es erst recht.', [1.2, 4], null, { energy: -4 }))] },
  { id: 'sneeze', icon: '🤧', title: 'Niesen im Anflug', text: 'Mitten im Rückschwung kündigt sich ein Niesen an.', options: [
    O('Unterdrücken und werfen', R('Du ziehst den Wurf durch, als wäre nichts gewesen.', [0.9, 2]), R('Der Dart rutscht dir weg.', [1.12, 2])),
    O('Absetzen und kurz durchatmen', R('Taschentuch, Atmen, frisch gestartet.', [0.86, 3]), R('Du findest den Rhythmus nicht sofort wieder.', [1.18, 3]))] },
  { id: 'sweat', icon: '💦', title: 'Schweiß auf der Stirn', text: 'Die Halle ist heiß, Schweißperlen laufen dir ins Auge.', options: [
    O('Mit dem Handtuch abwischen', R('Frischer Blick, klare Sicht.', [0.9, 3]), R('Das Handtuch ist feucht – es brennt in den Augen.', [1.12, 3])),
    O('Durchziehen und ignorieren', R('Der Fokus ist so stark, dass du nichts spürst.', [0.82, 3], null, { mom: 1 }), R('Der Schweiß brennt, die Sicht verschwimmt.', [1.2, 3]))] },
  { id: 'grin', icon: '😏', title: '{opp} grinst', text: '{opp} grinst dich nach seinem starken Checkout provozierend an.', options: [
    O('Zurückgrinsen', R('Du wirkst gelassen – {opp} wird unsicher.', null, [1.2, 3]), R('Das Grinsen wirkt aufgesetzt – es nervt dich selbst.', [1.2, 3])),
    O('Wegschauen und konzentrieren', R('Nichts kann dich aus der Ruhe bringen.', [0.9, 3]), R('Du grübelst trotzdem noch darüber nach.', [1.12, 3]))] },
  { id: 'chant', icon: '🎶', title: 'Fangesänge', text: 'Die Fans stimmen deinen Namen an – ziemlich laut.', options: [
    O('Hand heben und genießen', R('Die Halle bebt – du fliegst auf der Welle.', [0.84, 3], null, { fans: 1 }), R('Die Aufmerksamkeit lenkt ab, du verlierst den Faden.', [1.18, 3])),
    O('Kopf runter, Fokus halten', R('Du blendest den Jubel aus, volle Konzentration.', [0.9, 3]), R('Die Anspannung schnürt dir den Hals zu.', [1.12, 3], null, { fans: -1 }))] },
  { id: 'phone', icon: '📱', title: 'Handy klingelt', text: 'In der ersten Reihe klingelt laut ein Handy.', options: [
    O('Abwarten, bis Ruhe ist', R('Du wartest ruhig – umso klarer der nächste Wurf.', [0.9, 2]), R('Die Pause zieht sich, du verlierst den Faden.', [1.12, 3])),
    O('Sofort weiterwerfen', R('Du bleibst im Rhythmus und nutzt den Schwung.', [0.82, 3]), R('Das Klingeln hallt im Ohr, der Wurf wackelt.', [1.2, 3]))] },
  { id: 'caller', icon: '🎙️', title: 'Falsche Ansage', text: 'Der Caller sagt eine falsche Punktzahl an.', options: [
    O('Sofort reklamieren', R('Du hast recht – der Fehler wird korrigiert und du bekommst Applaus.', [0.88, 3], null, { fans: 1 }), R('Du verlierst Zeit und Nerven, der Caller war richtig.', [1.18, 3], null, { manager: -1 })),
    O('Ruhig bleiben, später klären', R('Die Ruhe überträgt sich auf deine Darts.', [0.92, 3]), R('Du ärgerst dich weiter über den Fehler.', [1.1, 3]))] },
  { id: 'dartfall', icon: '📌', title: 'Dart fällt heraus', text: 'Einer deiner steckenden Darts fällt aus dem Board.', options: [
    O('Schulterzucken und neu werfen', R('Mit lockerem Kopf wirfst du ihn wieder rein.', [0.9, 2]), R('Du ärgerst dich über das Pech.', [1.12, 3])),
    O('Lautstark meckern', R('Die Halle lacht mit dir, der Ärger ist weg.', [0.84, 3], null, { fans: 1 }), R('Dein Gemecker kommt schlecht an – unsportlich.', [1.18, 3], null, { sponsors: -1 }))] },
  { id: 'oche', icon: '👟', title: 'Rutschiger Oche', text: 'Der Boden am Oche fühlt sich plötzlich glatt an.', options: [
    O('Sohlen abwischen', R('Fester Stand, saubere Würfe.', [0.9, 3]), R('Du verlierst den Rhythmus beim Abwischen.', [1.12, 3])),
    O('Stand leicht verändern', R('Die neue Position fühlt sich besser an als vorher.', [0.82, 4]), R('Die Position ist ungewohnt – die Darts streuen.', [1.2, 4]))] },
  { id: 'thirst', icon: '🥤', title: 'Trockener Hals', text: 'Du merkst, wie trocken dein Hals ist.', options: [
    O('Kurz einen Schluck nehmen', R('Erfrischt und konzentriert geht es weiter.', [0.9, 3], null, { energy: 2 }), R('Du hast dich verschluckt, das Husten raubt Kraft.', [1.12, 3], null, { energy: -2 })),
    O('Ohne Pause weitermachen', R('Der Tunnel hält – du merkst nichts.', [0.84, 3]), R('Die Konzentration lässt nach.', [1.18, 3], null, { energy: -3 }))] },
  { id: 'thought', icon: '💭', title: 'Gedanken schweifen ab', text: 'Plötzlich schießt dir ein privater Gedanke durch den Kopf.', options: [
    O('Verdrängen und weiter', R('Der Gedanke verfliegt, du bist wieder voll da.', [0.9, 3]), R('Der Gedanke bleibt hängen.', [1.12, 3], null, { sat: -1 })),
    O('Kurz durchatmen und lächeln', R('Ein Lächeln befreit – du fühlst dich leicht.', [0.82, 4], null, { sat: 1 }), R('Das Lächeln wirkt gequält, die Würfe auch.', [1.2, 4]))] },
  { id: 'cup', icon: '🥛', title: 'Becher fliegt aufs Parkett', text: 'Ein Plastikbecher landet vor dir auf der Bühne.', options: [
    O('Ruhig bleiben', R('Du lässt dich nicht stören – der Wurf sitzt.', [0.9, 2]), R('Du schaust trotzdem hin und verlierst den Fokus.', [1.12, 3])),
    O('Zum Ordner winken', R('Der Ordner räumt flott auf, die Halle applaudiert.', [0.86, 3], null, { fans: 1 }), R('Es dauert ewig, bis jemand kommt – die Stimmung kippt.', [1.18, 3], null, { fans: -1 }))] },
  { id: 'pundit', icon: '📺', title: 'Kommentar aus den Boxen', text: 'Durch die Hallenlautsprecher hörst du, wie die Kommentatoren über deine Doppelquote reden.', options: [
    O('Weghören', R('Du blendest die Stimmen aus, volle Ruhe.', [0.9, 3]), R('Du bekommst trotzdem jedes Wort mit.', [1.12, 3])),
    O('Jetzt erst recht zeigen', R('Trotz kommt als Treibstoff an – die Doppel sitzen.', [0.8, 4], null, { mom: 1 }), R('Zu viel Wut – du verkrampfst.', [1.22, 4], null, { mom: -1 }))] },
  { id: 'cough', icon: '😷', title: 'Husten im Wurf', text: 'Genau in deinem Rückschwung hustet jemand laut los.', options: [
    O('Durchziehen', R('Kein Problem – du ziehst den Wurf sauber durch.', [0.9, 2]), R('Der Dart rutscht weg, du brauchst eine Weile, um wieder reinzukommen.', [1.12, 3])),
    O('Absetzen, neu ansetzen', R('Kurz durchatmen, neu fokussieren – alles im Griff.', [0.86, 3]), R('Du findest den Rhythmus nicht sofort wieder.', [1.15, 3]))] },
  { id: 'replay', icon: '🖥️', title: 'Wiederholung auf dem Videowürfel', text: 'Auf der großen Leinwand läuft dein Fehlwurf von eben in Zeitlupe.', options: [
    O('Wegschauen', R('Aus den Augen, aus dem Sinn.', [0.9, 3]), R('Du hast schon einen Blick riskiert – peinlich.', [1.12, 3])),
    O('Darüber lachen', R('Die Halle lacht mit dir – das lockert enorm.', [0.82, 4], null, { fans: 1 }), R('Du lachst und verlierst die Spannung.', [1.2, 4]))] },
  { id: 'shoe', icon: '👞', title: 'Offener Schuh', text: 'Du bemerkst, dass dein Schnürsenkel offen ist.', options: [
    O('Schnell zubinden', R('Kurze Pause, sicherer Stand.', [0.9, 3]), R('Die Pause lässt dich aus dem Takt fallen.', [1.12, 3])),
    O('Ignorieren', R('Du achtest nicht darauf – kein Problem.', [0.84, 3]), R('Du stolperst fast und wirst unsicher.', [1.18, 3]))] },
  { id: 'manager', icon: '💼', title: 'Manager winkt', text: 'Dein Manager winkt dir aus dem Backstage-Bereich hektisch zu.', options: [
    O('Kurz zurückwinken', R('Er gibt dir den Daumen hoch – das beflügelt.', [0.9, 3], null, { manager: 1 }), R('Du verlierst den Faden, er hat etwas ganz anderes gemeint.', [1.12, 3])),
    O('Nicht hinsehen', R('Du bleibst bei der Sache – volle Konzentration.', [0.84, 3]), R('Er ist beleidigt, du auch ein bisschen unsicher.', [1.18, 3], null, { manager: -1 }))] },
  { id: 'boo', icon: '👎', title: 'Pfiffe', text: 'Fans von {opp} pfeifen dich aus.', options: [
    O('Applaus fordern', R('Du drehst das Publikum – plötzlich jubeln sie mit!', [0.82, 4], null, { fans: 2 }), R('Der Schuss geht nach hinten los – noch mehr Pfiffe.', [1.2, 4], null, { fans: -1 })),
    O('Kopf runter und weiter', R('Du schaltest ab und bleibst cool.', [0.9, 3]), R('Die Pfiffe nagen an dir.', [1.12, 3]))] },
  { id: 'nerves', icon: '😬', title: 'Plötzlich Lampenfieber', text: 'Du spürst, wie viele Augen auf dich gerichtet sind.', options: [
    O('Tief ein- und ausatmen', R('Die Anspannung löst sich, die Hände werden ruhig.', [0.9, 3]), R('Du atmest zu bewusst – es wirkt verkrampft.', [1.12, 3])),
    O('An das Preisgeld denken', R('Der Gedanke beflügelt – du willst es unbedingt.', [0.82, 4]), R('Der Gedanke wird zu groß – das lähmt.', [1.2, 4], null, { sat: -1 }))] },
  { id: 'crackle', icon: '🔊', title: 'Knacken in den Lautsprechern', text: 'Ein lautes Knacken geht durch die Halle.', options: [
    O('Warten, bis es ruhig ist', R('Du nutzt die Pause und sammelst dich.', [0.9, 2]), R('Das Warten zieht sich und die Spannung kippt.', [1.12, 3])),
    O('Gleich weiterwerfen', R('Das Geräusch macht dich wach – dein Wurf sitzt.', [0.84, 3]), R('Du schreckst hoch und verziehst den Wurf.', [1.18, 3]))] },
  { id: 'spill', icon: '🍺', title: 'Getränk umgekippt', text: 'Dein Getränk kippt auf dem Tisch neben dir um.', options: [
    O('Selbst aufwischen', R('Ein souveräner Moment – die Halle schmunzelt.', [0.9, 3], null, { fans: 1 }), R('Du verlierst Zeit und Konzentration.', [1.12, 3])),
    O('Einem Helfer winken', R('Ein Helfer räumt auf, du bleibst im Tunnel.', [0.84, 3]), R('Es dauert und du wirst nervös.', [1.18, 3]))] },
  { id: 'rattle', icon: '🎲', title: '{opp} klappert mit den Darts', text: 'Während du am Oche stehst, spielt {opp} hinter dir mit seinen Pfeilen.', options: [
    O('Ignorieren', R('Du blendest das Klappern aus und bleibst im Rhythmus.', [0.9, 2]), R('Das Geräusch bleibt im Kopf – deine Aufnahmen wackeln.', [1.12, 3])),
    O('Ansprechen', R('{opp} entschuldigt sich kleinlaut und wirkt verunsichert.', null, [1.2, 3]), R('{opp} grinst nur. Du ärgerst dich und verlierst den Faden.', [1.2, 3]))] },
  { id: 'cheer', icon: '🥳', title: 'Applaus für den Gegner', text: 'Die Halle applaudiert {opp} nach seinem starken Leg minutenlang.', options: [
    O('Mitklatschen', R('Sportlich – die Fans lieben dich dafür.', [0.9, 3], null, { fans: 1 }), R('Du verlierst den Fokus beim Klatschen.', [1.12, 3])),
    O('Ruhig abwarten', R('Du lässt den Moment verstreichen – dann sitzt alles.', [0.84, 3]), R('Der Applaus hallt nach und macht dich nervös.', [1.18, 3]))] },
  { id: 'interview', icon: '🎤', title: 'Kamera im Gesicht', text: 'Ein Kameramann hält dir in der Pause fast das Objektiv in die Nase.', options: [
    O('Freundlich in die Kamera winken', R('Das Bild geht viral – super für deine Medienpräsenz!', [0.88, 3], null, { fans: 2 }), R('Du siehst auf der Leinwand ziemlich ungünstig aus.', [1.15, 3], null, { fans: -1 })),
    O('Wegdrehen', R('Du lässt dich nicht ablenken – volle Konzentration.', [0.9, 3]), R('Das wirkt arrogant, und du ärgerst dich.', [1.12, 3], null, { sponsors: -1 }))] },
];
