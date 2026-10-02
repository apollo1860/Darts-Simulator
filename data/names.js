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
// Vornamen für fiktive Spielerinnen (Women's Series)
export const WOMEN_FIRST = {
  EN: ['Emily', 'Chloe', 'Sophie', 'Lucy', 'Holly', 'Megan', 'Laura', 'Katie', 'Amy', 'Hannah'],
  NL: ['Femke', 'Lotte', 'Sanne', 'Anouk', 'Noor', 'Eva'], DE: ['Lena', 'Julia', 'Anna', 'Laura', 'Sarah', 'Lea'],
  EU: ['Zuzana', 'Ida', 'Agnieszka', 'Réka', 'Elena', 'Chiara', 'Marta', 'Linnea'],
};
// Namensraum je Nation
export const poolKeyOf = n => (['DE', 'AT', 'CH'].includes(n) ? 'DE' : ['NL', 'BE'].includes(n) ? 'NL'
  : ['ENG', 'SCO', 'WAL', 'NIR', 'IRL', 'AU', 'NZ', 'US', 'CA', 'IM', 'GI'].includes(n) ? 'EN'
  : ['JP', 'CN', 'IN', 'PH'].includes(n) ? n : ['HK', 'SG'].includes(n) ? 'CN' : ['BR', 'MX', 'AR'].includes(n) ? 'LA'
  : ['ZA', 'KE', 'NG'].includes(n) ? 'AF' : 'EU');
export const POOL_WEIGHTS = [['EN', 0.45], ['NL', 0.22], ['DE', 0.18], ['EU', 0.15]];
