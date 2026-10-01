// Bundesländer: lokale Turniere finden nur im eigenen Bundesland statt
export const REGIONS = {
  BW: { name: 'Baden-Württemberg', cities: ['Stuttgart', 'Mannheim', 'Karlsruhe', 'Freiburg', 'Heilbronn', 'Ulm', 'Pforzheim', 'Reutlingen'] },
  BY: { name: 'Bayern', cities: ['München', 'Nürnberg', 'Augsburg', 'Regensburg', 'Würzburg', 'Ingolstadt', 'Fürth', 'Erlangen'] },
  BE: { name: 'Berlin', cities: ['Berlin-Mitte', 'Neukölln', 'Spandau', 'Pankow', 'Charlottenburg', 'Lichtenberg', 'Köpenick', 'Wedding'] },
  BB: { name: 'Brandenburg', cities: ['Potsdam', 'Cottbus', 'Brandenburg a. d. H.', 'Frankfurt (Oder)', 'Oranienburg', 'Eberswalde'] },
  HB: { name: 'Bremen', cities: ['Bremen-Mitte', 'Bremerhaven', 'Vegesack', 'Findorff', 'Huchting'] },
  HH: { name: 'Hamburg', cities: ['Altona', 'Wandsbek', 'Harburg', 'Eimsbüttel', 'Bergedorf', 'St. Pauli'] },
  HE: { name: 'Hessen', cities: ['Frankfurt', 'Wiesbaden', 'Kassel', 'Darmstadt', 'Offenbach', 'Gießen', 'Fulda', 'Marburg'] },
  MV: { name: 'Mecklenburg-Vorpommern', cities: ['Rostock', 'Schwerin', 'Neubrandenburg', 'Stralsund', 'Greifswald', 'Wismar'] },
  NI: { name: 'Niedersachsen', cities: ['Hannover', 'Braunschweig', 'Oldenburg', 'Osnabrück', 'Wolfsburg', 'Göttingen', 'Hildesheim', 'Salzgitter'] },
  NW: { name: 'Nordrhein-Westfalen', cities: ['Köln', 'Dortmund', 'Essen', 'Düsseldorf', 'Bochum', 'Gelsenkirchen', 'Münster', 'Bielefeld', 'Oberhausen', 'Duisburg'] },
  RP: { name: 'Rheinland-Pfalz', cities: ['Mainz', 'Ludwigshafen', 'Koblenz', 'Trier', 'Kaiserslautern', 'Worms'] },
  SL: { name: 'Saarland', cities: ['Saarbrücken', 'Neunkirchen', 'Homburg', 'Völklingen', 'Saarlouis'] },
  SN: { name: 'Sachsen', cities: ['Leipzig', 'Dresden', 'Chemnitz', 'Zwickau', 'Plauen', 'Görlitz'] },
  ST: { name: 'Sachsen-Anhalt', cities: ['Magdeburg', 'Halle', 'Dessau', 'Wittenberg', 'Stendal'] },
  SH: { name: 'Schleswig-Holstein', cities: ['Kiel', 'Lübeck', 'Flensburg', 'Neumünster', 'Norderstedt'] },
  TH: { name: 'Thüringen', cities: ['Erfurt', 'Jena', 'Gera', 'Weimar', 'Gotha', 'Eisenach'] },
};
export const DEFAULT_REGION = 'NW';
