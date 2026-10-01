// Störmomente während der DartConnect-Simulation (nur wenn der Spieler wirft).
// Jede Situation hat 2 Optionen: eine sichere (höhere Chance, kleiner Effekt) und eine riskante
// (niedrigere Chance, großer Effekt in beide Richtungen).
// Chance = base + (Attribut − 60) · 0,6 % + Erfahrung · 1,5 %  (begrenzt auf 10–92 %)
// Effekte: [Streuungs-Multiplikator, Aufnahmen] – < 1 = besser, > 1 = schlechter. self = du, opp = Gegner.
// Ebenen: local (Kneipe/Verein), ddv (Verbandsturnier), pro (Tour/Major).
export const DISTRACTION_CHANCE = { local: 0.5, ddv: 0.35, pro: 0.25 };

export const DISTRACTIONS = [
  { id: 'rattle', levels: ['local', 'ddv'], icon: '🎯', title: '{opp} klappert mit den Darts',
    text: 'Während du am Oche stehst, spielt {opp} hinter dir lautstark mit seinen Pfeilen.',
    options: [
      { label: 'Ignorieren', attr: 'foc', base: 0.62,
        win: { text: 'Du blendest das Klappern aus und bleibst in deinem Rhythmus.', self: [0.97, 2] },
        lose: { text: 'Das Geräusch bleibt im Kopf – deine nächsten Aufnahmen wackeln.', self: [1.18, 3] } },
      { label: 'Ansprechen', attr: 'men', base: 0.45,
        win: { text: '{opp} entschuldigt sich kleinlaut und wirkt verunsichert.', opp: [1.15, 3] },
        lose: { text: '{opp} grinst nur. Du ärgerst dich und verlierst den Faden.', self: [1.25, 4] } },
    ] },
  { id: 'cough', levels: ['local', 'ddv', 'pro'], icon: '😷', title: 'Husten im Wurf',
    text: 'Genau in deinem Rückschwung hustet {who} laut los.',
    options: [
      { label: 'Durchziehen', attr: 'foc', base: 0.55,
        win: { text: 'Kein Problem – du ziehst den Wurf sauber durch.', self: [0.97, 1] },
        lose: { text: 'Der Dart rutscht weg, du brauchst eine Weile, um wieder reinzukommen.', self: [1.2, 2] } },
      { label: 'Absetzen, neu ansetzen', attr: 'men', base: 0.7,
        win: { text: 'Kurz durchatmen, neu fokussieren – alles wieder im Griff.' },
        lose: { text: 'Du findest den Rhythmus nicht sofort wieder.', self: [1.1, 2] } },
    ] },
  { id: 'chat', levels: ['local'], icon: '💬', title: '{opp} will quatschen',
    text: 'Zwischen den Aufnahmen erzählt dir {opp} ausführlich von seinem letzten Kegelabend.',
    options: [
      { label: 'Freundlich abblocken', attr: 'foc', base: 0.65,
        win: { text: 'Ein kurzes Nicken, dann zurück zur Scheibe.' },
        lose: { text: 'Du hörst doch zu – die Konzentration ist weg.', self: [1.15, 3] } },
      { label: 'Mitquatschen', attr: 'men', base: 0.4,
        win: { text: 'Ihr lacht – aber {opp} verliert dabei seinen Fokus, nicht du.', opp: [1.15, 3], self: [0.97, 2] },
        lose: { text: 'Du redest dich um Kopf und Kragen und aus dem Spiel.', self: [1.22, 4] } },
    ] },
  { id: 'phone', levels: ['local'], icon: '📱', title: 'Handy klingelt',
    text: 'Am Nebentisch klingelt ein Handy – Ballermann-Klingelton, volle Lautstärke.',
    options: [
      { label: 'Ignorieren', attr: 'foc', base: 0.6,
        win: { text: 'Du hörst es gar nicht mehr.' },
        lose: { text: 'Der Ohrwurm sitzt. Deine Darts landen daneben.', self: [1.15, 2] } },
      { label: 'Um Ruhe bitten', attr: 'men', base: 0.5,
        win: { text: 'Der Tisch entschuldigt sich, die Kneipe wird ruhig – du fühlst dich stark.', self: [0.95, 2] },
        lose: { text: 'Gelächter vom Nebentisch. Das nagt an dir.', self: [1.18, 3] } },
    ] },
  { id: 'heckle', levels: ['ddv', 'pro'], icon: '📣', title: 'Zwischenruf aus dem Publikum',
    text: 'Ein Zuschauer ruft „Bust!“, als du auf die Doppel zielst.',
    options: [
      { label: 'Ausblenden', attr: 'foc', base: 0.58,
        win: { text: 'Du hörst nur noch das Klacken deiner Darts.' },
        lose: { text: 'Der Ruf hallt nach – die Doppel wackeln.', self: [1.18, 3] } },
      { label: 'Kurz zum Publikum drehen', attr: 'men', base: 0.42,
        win: { text: 'Ein Lächeln, ein Fingerzeig – das Publikum feiert dich. Rückenwind!', self: [0.92, 3] },
        lose: { text: 'Pfiffe. Du verkrampfst.', self: [1.22, 3] } },
    ] },
  { id: 'slow', levels: ['ddv', 'pro'], icon: '⏱️', title: '{opp} spielt auf Zeit',
    text: '{opp} lässt sich vor jeder Aufnahme ewig Zeit und zerstört deinen Rhythmus.',
    options: [
      { label: 'Eigenen Rhythmus halten', attr: 'foc', base: 0.55,
        win: { text: 'Du bleibst bei dir. Das Spielchen verpufft.' },
        lose: { text: 'Das Warten macht dich nervös.', self: [1.15, 3] } },
      { label: 'Beim Schiedsrichter beschweren', attr: 'men', base: 0.4,
        win: { text: 'Der Schiedsrichter verwarnt {opp} – er wirkt angefasst.', opp: [1.18, 3] },
        lose: { text: 'Der Schiedsrichter winkt ab, du bist genervt.', self: [1.2, 3] } },
    ] },
  { id: 'boo', levels: ['pro'], icon: '👎', title: 'Publikum pfeift dich aus',
    text: 'Die Halle steht hinter {opp} und pfeift bei jedem deiner Würfe.',
    options: [
      { label: 'Ausblenden', attr: 'men', base: 0.5,
        win: { text: 'Du nimmst die Pfiffe als Energie.', self: [0.97, 2] },
        lose: { text: 'Es geht dir unter die Haut.', self: [1.15, 3] } },
      { label: 'Publikum anheizen', attr: 'men', base: 0.33,
        win: { text: 'Du drehst die Stimmung – die Halle feiert dich!', self: [0.88, 4] },
        lose: { text: 'Die Pfiffe werden lauter. Du verkrampfst.', self: [1.25, 4] } },
    ] },
];
