// Namensbausteine für generierte Nachwuchs-Talente (fiktiv)
export const NAME_POOLS = {
  EN: { nations: ['ENG', 'ENG', 'ENG', 'SCO', 'WAL', 'NIR', 'IRL', 'AU', 'US'],
    first: ['Jack', 'Harry', 'Charlie', 'Alfie', 'Oscar', 'Archie', 'Leo', 'Freddie', 'Theo', 'Josh', 'Kyle', 'Liam', 'Connor', 'Callum', 'Jordan', 'Reece', 'Tyler', 'Ellis', 'Brandon', 'Mason'],
    last: ['Walker', 'Holmes', 'Fletcher', 'Bradshaw', 'Kirkland', 'Simmons', 'Pearce', 'Doherty', 'Barker', 'Whitfield', 'Rowley', 'Ashworth', 'McKenna', 'Doyle', 'Griffiths', 'Hughes', 'Finch', 'Lowe', 'Marsh', 'Nolan'] },
  NL: { nations: ['NL', 'NL', 'BE'],
    first: ['Sem', 'Daan', 'Luuk', 'Bram', 'Jesse', 'Thijs', 'Milan', 'Stijn', 'Niels', 'Ruben', 'Wout', 'Jelle'],
    last: ['de Vries', 'van Dijk', 'Bakker', 'Janssen', 'Visser', 'Smit', 'Meijer', 'de Jong', 'van Leeuwen', 'Kok', 'Peeters', 'Maes'] },
  DE: { nations: ['DE', 'DE', 'AT', 'CH'],
    first: ['Leon', 'Finn', 'Paul', 'Jonas', 'Luis', 'Ben', 'Elias', 'Noah', 'Felix', 'Moritz', 'Jannik', 'Tim'],
    last: ['Schulz', 'Krüger', 'Hoffmann', 'Wagner', 'Becker', 'Lange', 'Wolff', 'Brandt', 'Seidel', 'Hahn', 'Gruber', 'Huber'] },
  EU: { nations: ['PL', 'CZ', 'SE', 'DK', 'LV', 'HU', 'FR', 'ES', 'IT', 'PT'],
    first: ['Jakub', 'Filip', 'Oskar', 'Emil', 'Mikkel', 'Kristaps', 'Bence', 'Hugo', 'Pablo', 'Matteo', 'Tomás', 'Viktor'],
    last: ['Kowalczyk', 'Dvořák', 'Lindqvist', 'Nielsen', 'Ozols', 'Nagy', 'Moreau', 'Navarro', 'Romano', 'Costa', 'Lewandowski', 'Berg'] },
};
// Weitere Namensräume für fiktive Amateure der internationalen Qualifier (nicht für Nachwuchs-Talente)
Object.assign(NAME_POOLS, {
  JP: { nations: ['JP'], first: ['Haruki', 'Ren', 'Sota', 'Yuto', 'Kaito', 'Daiki', 'Takumi', 'Ryo', 'Kenta', 'Shota'],
    last: ['Suzuki', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Kato', 'Yoshida', 'Matsumoto'] },
  CN: { nations: ['CN', 'HK', 'SG'], first: ['Wei', 'Jun', 'Hao', 'Lei', 'Ming', 'Tao', 'Bo', 'Jian', 'Yang', 'Kai'],
    last: ['Li', 'Wang', 'Zhang', 'Liu', 'Chen', 'Yang', 'Zhao', 'Huang', 'Zhou', 'Wu'] },
  IN: { nations: ['IN'], first: ['Arjun', 'Rohan', 'Vikram', 'Rahul', 'Aditya', 'Karan', 'Nikhil', 'Sanjay', 'Amit', 'Ravi'],
    last: ['Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Reddy', 'Nair', 'Mehta', 'Iyer', 'Desai'] },
  PH: { nations: ['PH'], first: ['Jose', 'Mark', 'John', 'Paolo', 'Rico', 'Noel', 'Ramon', 'Jerome', 'Carlo', 'Ariel'],
    last: ['Santos', 'Reyes', 'Cruz', 'Bautista', 'Garcia', 'Mendoza', 'Torres', 'Villanueva', 'Ramos', 'Aquino'] },
  LA: { nations: ['BR', 'MX', 'AR'], first: ['Carlos', 'Diego', 'Mateo', 'Luis', 'Juan', 'Andrés', 'Rafael', 'Pedro', 'Javier', 'Miguel'],
    last: ['González', 'Rodríguez', 'Hernández', 'López', 'Martínez', 'Pérez', 'Silva', 'Souza', 'Ramírez', 'Oliveira'] },
  AF: { nations: ['ZA', 'KE', 'NG'], first: ['Thabo', 'Sipho', 'Kagiso', 'Lwazi', 'Johan', 'Pieter', 'Kwame', 'Chidi', 'Tunde', 'Musa'],
    last: ['Nkosi', 'Dlamini', 'van der Merwe', 'Botha', 'Mokoena', 'Okafor', 'Mensah', 'Mwangi', 'Otieno', 'Naidoo'] },
});
// Größere, länderpassende Namensräume (Vor- und Nachnamen werden je Karriere zufällig kombiniert)
const ext = (k, first, last) => { NAME_POOLS[k].first = [...new Set([...NAME_POOLS[k].first, ...first])]; NAME_POOLS[k].last = [...new Set([...NAME_POOLS[k].last, ...last])]; };
ext('DE', ['Kevin', 'Sven', 'Marco', 'Dennis', 'Tobias', 'Rüdiger', 'Jens', 'Patrick', 'Uwe', 'Nico', 'Andreas', 'Daniel', 'Heiko', 'Lars',
  'Michael', 'Stefan', 'Timo', 'Frank', 'Thomas', 'Markus', 'Christian', 'Sebastian', 'Florian', 'Matthias', 'Dirk', 'Ralf', 'Jörg',
  'Torsten', 'Marcel', 'Dominik', 'Julian', 'Maximilian', 'Lukas', 'Philipp', 'Simon', 'Kai', 'René', 'Oliver', 'Holger', 'Manuel'],
['Kowalski', 'Lindner', 'Haas', 'Wendt', 'Pohl', 'Albrecht', 'Krämer', 'Busch', 'Vogt', 'Ostermann', 'Brückner', 'Engel', 'Sauer', 'Riedel',
  'Gerber', 'Ziegler', 'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Schäfer', 'Koch', 'Richter', 'Klein', 'Schröder',
  'Neumann', 'Schwarz', 'Zimmermann', 'Braun', 'Hofmann', 'Hartmann', 'Krause', 'Werner', 'Lehmann', 'Köhler', 'Maier', 'Franke', 'Kaiser',
  'Fuchs', 'Peters', 'Scholz', 'Möller', 'Jung', 'Weiß', 'Graf', 'Winter', 'Berger', 'Roth', 'Beck', 'Lorenz', 'Kuhn', 'Pfeiffer', 'Steiner']);
ext('NL', ['Kees', 'Joost', 'Martijn', 'Sander', 'Bas', 'Rick', 'Jeroen', 'Koen', 'Pieter', 'Dirk', 'Wim', 'Robin', 'Lars', 'Tom'],
  ['Mulder', 'de Boer', 'Bos', 'Vos', 'Dekker', 'Brouwer', 'Hendriks', 'van den Berg', 'Willems', 'Claes', 'Jacobs', 'Mertens', 'Vermeulen', 'Wouters', 'Dijkstra']);
ext('EN', ['Ryan', 'Dean', 'Lee', 'Craig', 'Gary', 'Wayne', 'Darren', 'Scott', 'Adam', 'Luke', 'Sam', 'Ben', 'Joe', 'Ross', 'Jamie', 'Dale', 'Steve', 'Paul'],
  ['Taylor', 'Wilson', 'Evans', 'Thomas', 'Roberts', 'Wright', 'Green', 'Hall', 'Wood', 'Clarke', 'Turner', 'Hill', 'Moore', 'Cooper', 'Ward',
    'Kelly', 'Murphy', "O'Brien", 'Campbell', 'Stewart', 'Jones', 'Davies', 'Pickering', 'Fraser', 'Lynch']);
Object.assign(NAME_POOLS, {
  PL: { nations: ['PL'], first: ['Jakub', 'Krzysztof', 'Tomasz', 'Paweł', 'Michał', 'Piotr', 'Marcin', 'Łukasz', 'Kamil', 'Mateusz', 'Sebastian'],
    last: ['Kowalczyk', 'Lewandowski', 'Nowak', 'Wiśniewski', 'Wójcik', 'Kamiński', 'Zieliński', 'Szymański', 'Woźniak', 'Dąbrowski', 'Mazur'] },
  CZ: { nations: ['CZ', 'SK'], first: ['Jakub', 'Ondřej', 'Lukáš', 'Tomáš', 'Petr', 'Martin', 'Jan', 'Filip', 'Michal', 'Pavel', 'Karel'],
    last: ['Dvořák', 'Novák', 'Svoboda', 'Černý', 'Procházka', 'Kučera', 'Veselý', 'Horák', 'Němec', 'Pokorný', 'Beneš'] },
  HU: { nations: ['HU'], first: ['Bence', 'Gergő', 'Dávid', 'Ádám', 'Levente', 'Máté', 'Balázs', 'Péter', 'Zoltán', 'Norbert'],
    last: ['Nagy', 'Kovács', 'Tóth', 'Szabó', 'Horváth', 'Varga', 'Kiss', 'Molnár', 'Németh', 'Farkas'] },
  NORD: { nations: ['SE', 'DK', 'NO', 'FI'], first: ['Oskar', 'Emil', 'Mikkel', 'Rasmus', 'Magnus', 'Henrik', 'Lars', 'Anders', 'Jussi', 'Mikko', 'Erik', 'Johan'],
    last: ['Lindqvist', 'Nielsen', 'Berg', 'Holm', 'Eriksson', 'Solberg', 'Lehtonen', 'Andersson', 'Jensen', 'Hansen', 'Virtanen', 'Larsen'] },
  BALT: { nations: ['LV', 'LT', 'EE'], first: ['Kristaps', 'Mārtiņš', 'Mindaugas', 'Tomas', 'Andris', 'Jānis', 'Kaspar', 'Rait', 'Darius', 'Edgars'],
    last: ['Ozols', 'Kalniņš', 'Petrauskas', 'Kazlauskas', 'Bērziņš', 'Tamm', 'Saar', 'Jankauskas', 'Liepa', 'Mägi'] },
  FR: { nations: ['FR'], first: ['Hugo', 'Lucas', 'Thomas', 'Julien', 'Nicolas', 'Mathieu', 'Antoine', 'Kevin', 'Romain', 'Maxime'],
    last: ['Moreau', 'Martin', 'Bernard', 'Dubois', 'Lefebvre', 'Laurent', 'Girard', 'Roux', 'Fournier', 'Mercier'] },
  IB: { nations: ['ES', 'PT', 'GI'], first: ['Pablo', 'Javier', 'Sergio', 'Alejandro', 'Diego', 'Tomás', 'João', 'Tiago', 'Rui', 'Miguel'],
    last: ['Navarro', 'García', 'Fernández', 'López', 'Sánchez', 'Costa', 'Silva', 'Pereira', 'Santos', 'Moreno'] },
  IT: { nations: ['IT'], first: ['Matteo', 'Luca', 'Marco', 'Andrea', 'Alessandro', 'Davide', 'Simone', 'Federico', 'Lorenzo', 'Paolo'],
    last: ['Romano', 'Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Colombo', 'Ricci', 'Marino', 'Greco'] },
  GR: { nations: ['GR'], first: ['Nikos', 'Giorgos', 'Dimitris', 'Kostas', 'Yannis', 'Panagiotis', 'Christos', 'Vasilis'],
    last: ['Papadakis', 'Papadopoulos', 'Georgiou', 'Nikolaidis', 'Karagiannis', 'Vlachos', 'Oikonomou', 'Dimitriou'] },
  BALK: { nations: ['HR', 'SI', 'RS', 'RO', 'BG'], first: ['Ivan', 'Matej', 'Luka', 'Marko', 'Nikola', 'Stefan', 'Andrei', 'Bogdan', 'Dimitar', 'Petar'],
    last: ['Kovačević', 'Novak', 'Horvat', 'Petrović', 'Jovanović', 'Popescu', 'Ionescu', 'Dimitrov', 'Georgiev', 'Babić'] },
});
const NATION_POOL = {};
for (const [k, v] of Object.entries(NAME_POOLS)) if (k !== 'EU') for (const n of v.nations) NATION_POOL[n] ??= k;
Object.assign(NATION_POOL, { AU: 'EN', NZ: 'EN', CA: 'EN', IM: 'EN', IRL: 'EN', US: 'EN', SCO: 'EN', WAL: 'EN', NIR: 'EN', BE: 'NL', AT: 'DE', CH: 'DE' });

// Vornamen für fiktive Spielerinnen (Women's Series)
export const WOMEN_FIRST = {
  EN: ['Emily', 'Chloe', 'Sophie', 'Lucy', 'Holly', 'Megan', 'Laura', 'Katie', 'Amy', 'Hannah'],
  NL: ['Femke', 'Lotte', 'Sanne', 'Anouk', 'Noor', 'Eva'], DE: ['Lena', 'Julia', 'Anna', 'Laura', 'Sarah', 'Lea'],
  EU: ['Zuzana', 'Ida', 'Agnieszka', 'Réka', 'Elena', 'Chiara', 'Marta', 'Linnea'],
};
// Namensraum je Nation (unbekannt → gemischt europäisch)
export const poolKeyOf = n => NATION_POOL[n] ?? 'EU';
// Zufälliger Name passend zur Nation (Vor- und Nachname frei kombiniert, eindeutig in `used`)
export function randomName(rng, nation, used = new Set(), woman = false) {
  const key = poolKeyOf(nation), pool = NAME_POOLS[key];
  const first = woman ? WOMEN_FIRST[key] ?? WOMEN_FIRST.EU : pool.first;
  let name;
  for (let i = 0; i < 50; i++) { name = `${rng.pick(first)} ${rng.pick(pool.last)}`; if (!used.has(name)) break; }
  used.add(name);
  return name;
}
export const POOL_WEIGHTS = [['EN', 0.45], ['NL', 0.22], ['DE', 0.18], ['EU', 0.15]];
