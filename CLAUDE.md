# Darts Career – Projektgedächtnis

FIFA-artiger Karrieremodus für Darts. Browserspiel, kein Backend, läuft lokal (per lokalem Webserver) und auf GitHub Pages.
Immer zuerst `STATUS.md` lesen (Phasenstand, Annahmen, Bugs). Pro Sitzung genau **eine Phase**. Am Phasenende: testen (`node tests/run.mjs`), `STATUS.md` updaten, committen.

## Arbeitsregeln
- Alles auf Deutsch (UI, Texte, knappe Kommentare).
- Chirurgische Edits, keine Komplett-Rewrites. Kurze Rückmeldungen.
- Unklar → sinnvollen Standard wählen, in `STATUS.md` unter „Annahmen“ notieren.
- Reines HTML/CSS/JS (ES-Module), keine Build-Tools, keine Abhängigkeiten.
- Logikmodule (`js/*.js` außer `main.js`, `matchUI.js`, `js/ui/**`) sind DOM-frei → in Node testbar.
- Zufall nur über `js/rng.js` (seedbar, Zustand liegt im Spielstand `state.rng`).

## Dateistruktur
```
index.html            Einstieg, lädt js/main.js
css/base.css          Design-Tokens, Reset, Typo, Layout
css/components.css    Button, Kachel, Karte (FUT), Tabelle, Modal, Toast, Bracket, Kalender
js/main.js            Bootstrap + Router (app.go(screen, params)), Auto-Save
js/rng.js             RNG (mulberry32) mit Zustand {s}
js/util.js            Formatierung (€, Zahlen de-DE), Datum/KW, esc()
js/state.js           Neue Karriere, Speicher-Slots (localStorage), Export/Import JSON
js/player.js          Attribute, Gesamtwertung, Average/Checkout-Ableitung, XP/Attributpunkte
js/world.js           KI-Welt (Tiers, Tourcards), Ruhestand/Nachwuchs/Entwicklung (developWorld), updateTiers
js/calendar.js        Wochenkalender, Events pro Woche, advanceWeek (Datum/Alter)
js/season.js          nextWeek(): KI-Turniere der Woche, Jahresabschluss (Tourcards, Kartenverlust), News
js/bracket.js         K.-o.-Baum: Setzliste, Freilose, Rundennamen, Platzierungen
js/tournaments.js     Berechtigung, Meldung, Feld/Setzliste, Mehrfach-Events (sub), Preisgeld/OOM, KI-Hintergrundturniere
js/matchEngine.js     Schnelle Simulation (Aufnahme-basiert), für Sim-Modus + alle KI-Hintergrundmatches
js/board.js           Scheibengeometrie (mm), scoreAt(), targetPoint(), Checkout-Wege, suggestTarget()
js/matchState.js      Dartgenauer Match-Zustand (Bust, Double-Out, Legs/Sets, Stats) – serialisierbar
js/throwModel.js      KI-Dart (Gauß um Ziel, σ aus Attributen), Parameter fürs manuelle Zielen, wave()
js/matchUI.js         Screen 'match': SVG-Scheibe, Zielkreuz, Linien (rAF), Scoreboard, Rest simulieren
js/rankings.js        Order of Merits: addMoney(), orderOfMerit(), rankOf()
js/finance.js         Kontostand, Buchungen, Kosten pro Event
js/sponsors.js        (Phase 6) Sponsoren
js/news.js            Nachrichten-Feed
js/ui/components.js   Toast, Modal, Spielerkarte, Tabelle, Header
js/ui/screens/*.js    Screens: menu, create, hub, week, calendar, event, watch, finance, profile,
                      stats, news, rankings, sponsors, settings, careerEnd
data/nations.js       Nationen + Flaggen
data/players.js       Spielerlisten: TOUR_TOP64 / TOUR_EXPIRING / TOUR_NEW_2026 (=128), Challenge 50, Dev 50, Lokal 50
data/names.js         Namensbausteine für generierte Talente
data/tournaments.js   Jahreskalender (KW-basiert), Kategorien, Formate
data/prizemoney.js    Preisgeldtabellen in €
tests/run.mjs         Node-Tests (Regeln, Checkouts, Turnierablauf, Live-Match)
tests/*.mjs           Kalibrierung: calib (Sim), fitSigma/calibDarts (KI-Darts), humanSim (manuell), season
```
Start lokal: `python3 -m http.server` im Projektordner → http://localhost:8000 (ES-Module laufen nicht über file://).

## Datenmodell (Spielstand `state`)
```
version, slot, savedAt, rng:{s}, date:{year, week}
player: {id:'P', name, nation, hand, age, attrs:{sco,fin,con,ner,sta}, xp, xpTotal, pointsEarned, points,
         tour:'none'|'tour', cardUntil (letzte gültige Saison), qschoolYear (→ CT/Dev-Berechtigung), avgReal, everTourcard}
world:  {version:2, nextId, players:{id:{id,name,nation,age,avg,tier,cardUntil,attrs}}}   tier: tour|challenge|dev|local
        IDs: T=Top64, X=Karte Ende 2026 verloren, N=neu 2026, C=Challenge, D=Dev, L=lokal, G=generierte Talente
rankings:{years:{[year]:{challenge|dev|pdc|protour:{[id]:€}}}}
finance:{balance, tx:[{year,week,text,amount,cat}]}
week:   {played:bool, eventId}         aktuelle Woche
activeEvent: Turnier-Instanz oder null: {eventId, cat, sub/count (Teil-Turnier), rounds[{name,remaining,format,matches[{a,b,winner,score,bye}]}],
         stopAt (Q-School 4), place ('W','F',…,'CARD'), hasNext, survivors, live:{m,me}|null}
news:[{year,week,type,title,text}], results:[{year,week,eventId,name,cat,place,prize}]
stats:  {career:{...}, seasons:{[year]:{...}}}
sponsors:{active:[], offers:[]}, ended:bool
```
Speicher: `localStorage['dartsCareer.slot.N']` (N=1..3), Auto-Save nach jeder Woche und nach jedem Turnier.

## Spielregeln (Kurzfassung Spezifikation)
- **Start**: Jahr 2027, KW 1, Alter 18, Budget 5.000 €, keine Tourcard. Gesamtwertung ~40–50. **Kein vorgegebener Average**: Spieler wird nur über Attribute beschrieben; angezeigt wird der echte, gespielte Karriere-Average (`player.avgReal`, vor dem 1. Match „–“).
- **Attribute** (1–99): Scoring (sco), Doppelquote (fin), Konstanz (con), Nervenstärke (ner), Ausdauer (sta).
  - Gesamt = 0,35·sco + 0,30·fin + 0,15·con + 0,10·ner + 0,10·sta
  - Interne Engine-Leistung = 30 + 0,77·sco (nur Simulation, nicht als Spielerwert angezeigt) ; Checkout-Basis = 0,12 + 0,0033·fin
  - Konstanz → Streuung der Aufnahmen und der Tagesform; Nervenstärke → Checkout bei Entscheidungsleg/Match-Darts; Ausdauer → Leistungsabfall in langen Matches.
- **XP**: aus Matches/Turnieren (Faktor nach Kategorie). Punkt-Schwelle = 50 + 3·(bisher verdiente Punkte); XP je Match 14, Sieg +22, +8 je Runde (max. 6), Titel/Karte +60. Attribut erhöhen kostet 1 Punkt (<60), 2 (60–79), 3 (≥80). Kein Alterungsverlust. Alter +1 zum Jahreswechsel.
- **Kalender**: ISO-KW 1–52 (KW 53 wird übersprungen). Pro Woche max. ein Event. „Weiter“ → nächste Woche.
- **Kosten**: Anmeldegebühr 25 € (Q-School, Challenge, Dev). Reise: England/UK 600 €, Deutschland 250 €, sonst 400 €. Lokal: kostenlos, keine Reise. Melden nur bei genug Budget.
- **Lokale Turniere**: jede Woche außer KW 52, 32 Spieler (fiktiv), Siegprämie zufällig 50–200 €, Finalist 40 %, Halbfinale 20 %.
- **Tour-Struktur (Phase 3 umgesetzt)**:
  - Start 2027: 2026er Top 64 (Karte bis 2028) + 28 Neue 2026 (bis 2027) + je Top 2 CT/Dev 2026 (= stärkste, bis 2028) = 96 Karten; 36 weitere 2026er Holder verlieren die Karte → Q-School.
  - Q-School KW 2: UK (Milton Keynes, Nationen UK/IRL/AUS/USA…) und EU (Kalkar, Rest). Je 4 Tage, jeder Tag K.-o. ohne Setzliste, first to 5; wer das Halbfinale erreicht (letzte 4) → Tourcard bis Ende Folgejahr. Kartengewinner fehlen an späteren Tagen. Teilnahme → CT-Berechtigung (+ Dev bis 23) für das Jahr.
  - Challenge Tour: 12 Wochenenden × 2 Turniere, Feld = alle ohne Karte (Challenge+Dev) + Spieler, Setzliste nach CT-OOM, Freilose. Dev Tour analog nur ≤ 23. Youth-WM (KW 45) zählt nicht zur OOM.
  - KI-Events laufen im Hintergrund (season.nextWeek → simulateWeekAI), Preisgeld → OOM.
  - Jahresende: CT-OOM Top 2 + Dev-OOM Top 2 (ohne Karte, Preisgeld > 0) → Karte bis Jahr+2. Auslaufende Karten: PDC-OOM-Rang ≤ 64 → verlängert bis Jahr+2, sonst Verlust → Challenge. Danach developWorld: Stärke nach Alter (jung +, alt −), Ruhestand ab 45, Pool ohne Karte wird mit Talenten (16–18 J.) auf 100 aufgefüllt. Neujahr: Alter +1, Dev ab 24 → Challenge.
  - Tourcard-Holder nicht auf Challenge/Dev und umgekehrt.
- **Rankings**: PDC OOM (rollierend 2 Jahre), Pro Tour OOM, Challenge OOM, Dev OOM.
- **Sponsoren (Phase 6)**: erst nach erster Tourcard, max. 4, Laufzeit 1–3 Jahre, jederzeit kündbar.

## Match-Engine
- Format: `{legs:n}` = first to n Legs; `{sets:s, legs:l}` = first to s Sets, je first to l Legs. 501, Double Out.
- Simulation aufnahmebasiert: Scoring-Aufnahme ~ Normal(avg·Form, sd(con)), 180er-Chance aus avg; Finish-Bereich (≤170, keine Bogey-Zahlen) mit Wahrscheinlichkeit aus Checkout-Basis × Restpunkt-Faktor; ≤50 dartgenau auf Doppel.
- Stats: Average (Punkte/Darts·3), 180er, 140+, 100+, Checkout-% (Treffer/Doppelversuche), höchstes Finish.
- **Manueller Modus** (`matchUI.js`): Ziel wählen (Tippen auf Scheibe / Chips, Standard = `suggestTarget`: T20 bzw. Checkout-Weg) → „Werfen“ → vertikale Linie (x) stoppen → horizontale Linie (y) stoppen → Treffer = Schnittpunkt + Gauß-Reststreuung. Bedienung: Tippen, Button oder Leertaste.
  - Linienposition = Ziel + amp·wave(Startphase + t·freq), t aus `performance.now()` → frameunabhängig. amp = 66 − 0,48·sco (mm), freq = 0,75 + 0,6·(1 − sco/99) Hz (y-Linie ×1,13), Reststreuung = 12 − 0,085·con mm.
  - Doppel/Bull als Ziel: amp & Streuung × (1,3 − fin/200). Druck (Entscheidungsleg, Doppel-Finish, Match-Dart) × (1 + Last·(1 − ner/99)·1,6). Ausdauer: ab Leg 9 leicht steigend.
- **Gegner-KI** (live): dartgenau, Ziel = `suggestTarget`, Streuung σ je Achse aus Average-Tabelle (`SIGMA_TABLE`, kalibriert mit `tests/fitSigma.mjs`), Doppel-σ aus Checkout-Basis (analytisch). Gleiche Druck-/Ausdauerfaktoren.
- **Schnellsimulation** (`js/ui/screens/watch.js`, Screen 'watch'): DartConnect-Stil, 1 Aufnahme alle 1,5 s (`VISIT_MS`), dartgenaue KI für beide Seiten. Eigener Spieler links; je Spieler Rest groß, daneben rot Leg-Average, weiß Gesamt-Average; Liste aller Aufnahmen des Legs mit Aufnahme-Nr. in der Mitte, Pfeil = wer dran ist, Punkt = Anwurf. Pause / Selbst spielen / Sofort beenden. Nutzt `inst.live` → jederzeit zwischen Zuschauen und Selbstspielen wechselbar.
- **Rest simulieren**: Live-Match wird dartgenau mit KI-Modell für beide Seiten beendet (`simulateLiveRest`). Live-Match wird nach jeder Aufnahme gespeichert und kann fortgesetzt werden.

## Designsystem (FIFA-Look)
- Tokens in `css/base.css` (`--bg`, `--panel`, `--cyan`, `--green`, `--gold`, `--red`, …). Dunkler Blau/Schwarz-Verlauf, Neon-Akzente.
- Überschriften: Saira Condensed, kursiv, Großbuchstaben (`.h-display`). Text: Inter/Systemschrift.
- Schräge Kanten per `clip-path` (`.skew-edge`), Glas-Kacheln (`.tile`), Kachel-Raster `.tile-grid` (responsive).
- Komponenten: `.btn` (`.btn-primary/.btn-ghost/.btn-gold`), `.tile`, `.fut-card`, `.table`, Modal (`ui.modal()`), Toast (`ui.toast()`), `.tag-<kategorie>`.
- Währung immer `fmtEUR()` (de-DE). Kein Walk-on.
