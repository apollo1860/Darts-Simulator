// New Star Darts: Lebens-Ereignisse (Karten). Je Woche 35 % Chance auf eins (wenn keins offen ist).
// {preis} im Text = Kosten der ersten kostenpflichtigen Option (mit Status-Faktor); if(p, state) = Bedingung; Optionen mit Effekten: energy, sat, fans, partner, manager, sponsors, stars (Basis-★, × Status-Faktor; negativ = Kosten),
// priced (true = Gewinn wächst wie die Preise statt wie die Einnahmen, z. B. Rubbellos-Jackpot), idle (true = Trainingsrückstand zurücksetzen), single (Beziehung endet), meet (neue Freundin, Startwert), chance {p, ok, fail}.
// Texte: {partner} = Name der Freundin. Aktionen (Auftritte, Feiern …) kosten immer 60 % Energie (nur ab 60 % wählbar);
// Beziehungs-Änderungen durch Ereignisse sind auf ±2 begrenzt (life.js).
import { LIFESTYLE } from './lifestyle.js';
export const PARTNER_NAMES_M = ['Lukas', 'Jonas', 'Leon', 'Finn', 'Paul', 'Ben', 'Tom', 'Max', 'Noah', 'Elias', 'Jack', 'Oliver', 'Harry', 'Daan', 'Sem', 'Liam', 'Mats', 'Felix', 'Tim', 'Niklas', 'Jan', 'Moritz', 'Julian', 'David', 'Simon', 'Fabian', 'Florian', 'Tobias', 'Sebastian', 'Philipp', 'Alexander', 'Daniel', 'Marcel', 'Kevin', 'Dennis', 'Patrick', 'Christian', 'Dominik', 'Marco', 'Sven', 'Kai', 'Lars', 'Erik', 'Henrik', 'Malte', 'Jannik', 'Luca', 'Matteo', 'Emil', 'Theo', 'Anton', 'Jakob', 'Oskar', 'Milan', 'Can', 'Yusuf', 'Ryan', 'Ethan', 'George', 'Charlie', 'Thomas', 'James', 'Lewis', 'Dylan', 'Bram', 'Ruben', 'Thijs', 'Jesse', 'Pieter', 'Lorenzo', 'Tomas', 'Mateo', 'Hugo', 'Louis', 'Rafael', 'Mikkel', 'Jonathan', 'Arne', 'Ole', 'Henry'];   // Version 100: Partner von Spielerinnen
export const PARTNER_NAMES = ['Lena', 'Laura', 'Sarah', 'Julia', 'Anna', 'Lisa', 'Marie', 'Sophie', 'Emma', 'Mia', 'Hannah', 'Jessica', 'Nina', 'Kim', 'Chloe', 'Emily', 'Olivia', 'Sanne', 'Femke', 'Alicia', 'Lea', 'Leonie', 'Clara', 'Johanna', 'Amelie', 'Charlotte', 'Lina', 'Ella', 'Emilia', 'Paula', 'Luisa', 'Greta', 'Mila', 'Frieda', 'Ida', 'Isabel', 'Jana', 'Katharina', 'Vanessa', 'Melanie', 'Sandra', 'Nicole', 'Tanja', 'Stefanie', 'Carina', 'Selina', 'Michelle', 'Jasmin', 'Vivien', 'Celine', 'Nadine', 'Franziska', 'Theresa', 'Miriam', 'Ronja', 'Svenja', 'Kira', 'Maja', 'Elif', 'Aylin', 'Zoe', 'Ava', 'Grace', 'Ruby', 'Isla', 'Amber', 'Lotte', 'Eva', 'Noor', 'Fleur', 'Ilse', 'Giulia', 'Chiara', 'Sofia', 'Elena', 'Lucia', 'Camille', 'Ines', 'Natalia', 'Zuzana'];   // Version 124: je 80 Namen
const hasPartner = p => (p.rel?.partner ?? 0) > 0;
// Version 134: Fahrzeuge, die man verleihen kann (ohne Abo), intakt und im Besitz
export const lendableCars = p => LIFESTYLE.filter(x => x.cat === 'vehicle' && !x.id.endsWith('abo') && p.owned?.includes(x.id) && !p.upkeep?.[x.id]?.broken);
export const borrowers = (p, s) => [hasPartner(p) ? 'partner' : null, s?.team?.manager && (p.rel?.manager ?? 0) > 0 ? 'manager' : null].filter(Boolean);
export const BORROW_CRASH = 0.2;   // Risiko: Fahrzeug kommt kaputt zurück

// Version 216: Unfälle → Fähigkeitsrückfall (Scoring oder Finishing −1…2, nur mit mind. 1 Punkt). Ohne Fahrzeug Haushaltsunfälle,
// mit Fahrzeug Unfälle mit einem eigenen Fahrzeug ({car}). Gewählt wird beim Auslösen (life.js: rollLifeEvent), abgezogen beim Bestätigen.
export const ACCIDENTS_HOME = [
  'Autsch! Du hast dir den Wurffinger in der Tür eingequetscht.',
  'Beim Gemüseschneiden rutscht das Messer ab – eine tiefe Schnittwunde am Finger.',
  'Beim Heimwerken triffst du mit dem Hammer voll deinen Daumen.',
  'Du rutschst in der Dusche aus und fängst dich mit der Wurfhand ab.',
];
export const ACCIDENTS_VEHICLE = {
  car: ['Autounfall mit deinem {car}! Zum Glück nur Blechschaden – aber deine Hand hat beim Aufprall etwas abbekommen.'],
  scooter: ['E-Scooter-Unfall! Du bist mit dem {car} an einer Bordsteinkante hängen geblieben und auf die Hand gestürzt.'],
  bike: ['Sturz mit dem {car}! Du landest auf der Wurfhand.'],
  water: ['Unfall mit deinem {car}: Eine Welle reißt dich von den Füßen, du prallst mit der Hand gegen die Reling.'],
  air: ['Harte Landung mit deinem {car}! Beim Aufprall verstauchst du dir die Wurfhand.'],
  other: ['Unfall mit deinem {car}! Beim Aussteigen klemmst du dir die Wurfhand ein.'],
};
export const VEHICLE_KIND = { kleinwagen: 'car', van: 'car', sportwagen: 'car', sattelzug: 'car', limousine: 'car', rennwagen: 'car', panzer: 'other',
  limeprimeabo: 'scooter', tretroller: 'scooter', roller: 'scooter', fahrrad: 'bike', motorrad: 'bike',
  jetski: 'water', segelboot: 'water', fischerboot: 'water', luftkissenboot: 'water', yacht: 'water',
  haengegleiter: 'air', heissluftballon: 'air', hubschrauber: 'air', privatjet: 'air', duesenjaeger: 'air' };
export const ownedVehicles = p => LIFESTYLE.filter(x => x.cat === 'vehicle' && p.owned?.includes(x.id));
export const accidentSkills = p => ['sco', 'fin'].filter(k => (p.skills?.[k] ?? []).some(v => v > 0));

// Version 281: alter Darts-Kumpel leiht dir seine besseren Darts (nur bei Formkrise, siehe life.js rollFriendDarts) – nicht im Zufallspool
export const OLD_FRIENDS = ['Kalle', 'Rudi', 'Manni', 'Heinz', 'Olaf', 'Bernd', 'Uwe', 'Jürgen', 'Klaus', 'Dieter', 'Gerd', 'Hotte'];
export const LIFE_EVENTS = [
  { id: 'olddarts', special: true, icon: '🎯', text: 'Dein alter Darts-Kumpel {friend} hat gehört, dass es gerade gar nicht läuft. Er drückt dir seine kaum benutzten {darts} in die Hand: „Die haben mir damals Glück gebracht – nimm sie, keine Widerrede!“',
    opts: [{ label: 'Annehmen', friendDarts: true, out: 'Die alten Darts liegen erstaunlich gut in der Hand.' }] },
  { id: 'party', icon: '🎉', text: 'Deine Kumpels schmeißen eine Party und wollen dich unbedingt dabeihaben.',
    opts: [{ label: 'Hingehen', energy: -60, sat: 8, fans: 1, out: 'Lange Nacht, gute Laune.' },
      { label: 'Absagen', sat: -3, out: 'Die Jungs sind etwas enttäuscht.' }] },
  { id: 'meet', icon: '💘', if: p => !hasPartner(p), text: 'Nach dem Turnier spricht dich {partner} an der Bar an. Sie scheint sich für Darts zu interessieren …',
    // Chance hängt von Lifestyle und Star-Status ab (life.js: meetChance); ohne beides wirst du ausgelacht
    opts: [{ label: 'Auf einen Drink einladen', stars: -2, chance: { p: 'meet', ok: { meet: 30, sat: 10, out: 'Ihr versteht euch blendend – ihr seid jetzt zusammen!' }, fail: { fans: -1, sat: -3, out: 'Sie lacht dich aus und geht zu ihren Freundinnen zurück. Autsch.' } } },
      { label: 'Freundlich abwinken', out: 'Du konzentrierst dich auf Darts.' }] },
  // Version 213: Shoppingtour – Ja → Lifestyle-Shop (life.js: startShopping/endShopping), Nein → verärgert; bewusst ohne Hinweis auf die Folgen
  { id: 'shopping', icon: '🛍️', if: hasPartner, text: '{partner} hat Lust auf eine Shoppingtour und möchte, dass du mitkommst.',
    opts: [{ label: 'Klar, gehen wir!', shop: true },
      { label: 'Keine Lust', shopNo: true, out: '{partner} zieht alleine los.' }] },
  { id: 'accident', icon: '🩹', if: p => accidentSkills(p).length > 0, text: '{accident}',
    opts: [{ label: 'Autsch …', accident: true, out: 'Das wird dich etwas zurückwerfen.' }] },
  { id: 'dinner', icon: '🍝', if: hasPartner, text: '{partner} möchte mit dir schick essen gehen.',
    opts: [{ label: 'Edles Restaurant', stars: -5, partner: 6, sat: 4, out: '{partner} strahlt den ganzen Abend.' },
      { label: 'Gemütlich zu Hause', partner: 2, energy: 5, out: 'Pizza und Couch – auch schön.' },
      { label: 'Keine Zeit, Training', partner: -5, out: '{partner} ist ziemlich sauer.' }] },
  { id: 'birthday', icon: '🎂', if: hasPartner, text: '{partner} hat Geburtstag!',
    opts: [{ label: 'Großes Geschenk', stars: -15, partner: 10, sat: 3, out: 'Volltreffer – sie ist begeistert.' },
      { label: 'Blumen', stars: -2, partner: 3, out: 'Eine nette Geste.' },
      { label: 'Vergessen …', partner: -12, sat: -4, out: 'Oh oh. Das gibt Ärger.' }] },
  // Version 124: Affären-Angebot – Zufriedenheit rauf, fliegt aber zu 10 % auf (dann Trennung bzw. Scheidung). {lover} = Name der Affäre.
  { id: 'affair', icon: '💋', if: hasPartner, text: '{lover} flirtet nach dem Turnier heftig mit dir und will dich unbedingt wiedersehen.',
    opts: [{ label: 'Darauf einlassen', sat: 12, chance: { p: 0.1, ok: { single: true, sat: -15, out: 'Die Affäre mit {lover} fliegt auf – {partner} hat genug. Es ist aus.' }, fail: { out: 'Ein aufregendes Abenteuer mit {lover}.' } } },
      { label: 'Abblitzen lassen', partner: 1, out: 'Du bleibst {partner} treu.' }] },
  // Version 134: Manager oder Freundin wollen ein gekauftes Fahrzeug leihen ({who} = Person, {car} = Fahrzeug). Ja: leichtes Plus, 20 % kaputt (Reparatur wie Wartung); Nein: Beziehung leidet.
  { id: 'borrow', icon: '🔑', if: (p, s) => lendableCars(p).length > 0 && borrowers(p, s).length > 0, text: '{who} möchte sich für ein paar Tage dein Fahrzeug leihen: {car}.',
    opts: [{ label: 'Klar, gerne', borrower: 1, chance: { p: BORROW_CRASH, ok: { crash: true, out: '{who} bringt {car} beschädigt zurück – die Reparatur zahlst du.' }, fail: { out: '{car} kommt heil zurück. {who} bedankt sich.' } } },
      { label: 'Lieber nicht', borrower: -2, out: '{who} ist enttäuscht.' }] },
  { id: 'jealous', icon: '😤', if: hasPartner, text: '{partner} fühlt sich vernachlässigt: „Immer nur Darts!“',
    opts: [{ label: 'Wochenende frei nehmen', energy: 10, partner: 6, out: 'Ein ruhiges Wochenende zu zweit tut euch gut.' },
      { label: 'Darts geht vor', partner: -8, chance: { p: 0.25, ok: { single: true, sat: -10, out: '{partner} macht Schluss.' }, fail: { out: '{partner} zieht sich zurück.' } } }] },
  { id: 'fanvideo', icon: '📱', text: 'Ein junger Fan bittet um eine Video-Grußbotschaft.',
    opts: [{ label: 'Klar, mach ich', energy: -60, fans: 3, out: 'Das Video geht viral – die Fans lieben es.' },
      { label: 'Keine Zeit', fans: -2, out: 'Schade, findet die Community.' }] },
  { id: 'charity', icon: '🤝', text: 'Du wirst zu einem Charity-Darts-Abend für ein Kinderhospiz eingeladen.',
    opts: [{ label: 'Mitmachen', energy: -60, fans: 4, sponsors: 2, sat: 4, out: 'Ein bewegender Abend für einen guten Zweck.' },
      { label: 'Ablehnen', out: 'Vielleicht beim nächsten Mal.' }] },
  { id: 'tv', icon: '📺', text: 'Das Regionalfernsehen möchte ein Porträt über dich drehen.',
    opts: [{ label: 'Gerne', energy: -60, fans: 3, sat: 2, out: 'Du machst eine gute Figur vor der Kamera.' },
      { label: 'Lieber nicht', out: 'Du bleibst lieber im Hintergrund.' }] },
  { id: 'pubshow', icon: '🍻', text: 'Eine Kneipe bucht dich für einen Show-Abend gegen ihre Stammgäste.',
    opts: [{ label: 'Annehmen', stars: 4, energy: -60, fans: 2, out: 'Gage kassiert, Stimmung bestens.' },
      { label: 'Ablehnen', energy: 5, out: 'Du ruhst dich lieber aus.' }] },
  { id: 'strain', icon: '🩹', text: 'Dein Wurfarm zwickt – eine leichte Zerrung.',
    opts: [{ label: 'Zum Physio', stars: -4, energy: 10, out: 'Gut behandelt, alles locker.' },
      { label: 'Durchbeißen', energy: -15, sat: -3, out: 'Es zieht noch eine Weile.' }] },
  { id: 'scratch', icon: '🎟️', text: 'An der Tanke liegt ein Rubbellos für {preis} ★.',
    opts: [{ label: 'Rubbeln', stars: -1, chance: { p: 0.05, ok: { stars: 20, priced: true, sat: 5, out: 'Jackpot! Gewinn!' }, fail: { out: 'Niete.' } } },
      { label: 'Lieber nicht', out: 'Vernünftig.' }] },
  { id: 'family', icon: '👪', text: 'Deine Familie lädt dich übers Wochenende nach Hause ein.',
    opts: [{ label: 'Hinfahren', energy: 10, sat: 6, out: 'Mamas Essen wirkt Wunder.' },
      { label: 'Keine Zeit', sat: -4, out: 'Deine Eltern sind traurig.' }] },
  { id: 'trash', icon: '🗞️', text: 'Ein Tour-Konkurrent lästert in der Presse über deine „Glückstreffer“.',
    opts: [{ label: 'Kontern', chance: { p: 0.6, ok: { fans: 3, sat: 3, out: 'Dein Konter sitzt – die Fans feiern dich.' }, fail: { fans: -2, out: 'Das ging nach hinten los.' } } },
      { label: 'Ignorieren', sat: -1, out: 'Du lässt lieber die Darts sprechen.' }] },
  { id: 'photo', icon: '📸', text: 'Ein peinliches Partyfoto von dir taucht im Netz auf.',
    opts: [{ label: 'Entschuldigen', fans: -1, out: 'Die Sache ist schnell vergessen.' },
      { label: 'Mit Humor nehmen', chance: { p: 0.5, ok: { fans: 3, out: 'Die Leute lachen mit dir.' }, fail: { fans: -4, sat: -2, out: 'Nicht alle finden das lustig.' } } }] },
  { id: 'club', icon: '🪩', text: 'Ein paar Tour-Spieler ziehen nach dem Turnier noch in einen Club.',
    opts: [{ label: 'Mitfeiern', energy: -60, sat: 10, out: 'Legendäre Nacht.' },
      { label: 'Ins Hotel', energy: 5, out: 'Ausgeschlafen in die neue Woche.' }] },
  { id: 'camp', icon: '🏋️', text: 'Ein Ex-Profi bietet dir einen privaten Trainingstag an.',
    opts: [{ label: 'Buchen', stars: -8, energy: -60, idle: true, out: 'Viel gelernt – deine Fähigkeiten sind wieder frisch.' },
      { label: 'Ablehnen', out: 'Du trainierst lieber allein.' }] },
  { id: 'housewarming', icon: '🏠', if: p => (p.owned ?? []).some(id => ['bungalow', 'haus', 'blockhuette', 'stadthaus', 'landhaus', 'strandhaus', 'ferienvilla', 'skihuette', 'bauernhof', 'weingut', 'privatinsel', 'wolkenkratzer', 'schlossneuschwanstein', 'burjkhalifa'].includes(id)), text: 'Zeit für eine Party in deinem neuen Zuhause?',
    opts: [{ label: 'Party!', stars: -3, energy: -60, fans: 2, sat: 6, out: 'Alle beneiden dich um dein Zuhause.' },
      { label: 'Ruhig bleiben', energy: 5, out: 'Du genießt die Ruhe.' }] },
  { id: 'carfan', icon: '🚗', if: p => (p.owned ?? []).some(id => ['sportwagen', 'limousine', 'rennwagen'].includes(id)), text: 'Fans erkennen dich an deinem Auto und wollen Selfies.',
    opts: [{ label: 'Anhalten', energy: -60, fans: 3, out: 'Ein Dutzend Selfies später …' },
      { label: 'Weiterfahren', fans: -1, out: 'Du hast es eilig.' }] },
];
