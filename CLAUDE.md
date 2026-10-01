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
js/player.js          Perzentil-Attribute (sco/fin/men/foc/cal), Erfahrung (exp −4…+10), Average-Kurve, XP, calcError()
js/training.js        Wochenplan: Training/Ruhetag/Sponsortermin/Exhibition (1 pro Woche), Formverlust, Ermüdung
js/decisions.js       Checkout-Entscheidungen im DartConnect (Wege, geschätzte Chancen, gewählter Weg)
js/world.js           KI-Welt (Tiers, Tourcards), Ruhestand/Nachwuchs/Entwicklung (developWorld), updateTiers
js/calendar.js        Wochenkalender, Events pro Woche, advanceWeek (Datum/Alter)
js/season.js          nextWeek(): KI-Turniere der Woche, Jahresabschluss (Tourcards, Kartenverlust), News
js/bracket.js         K.-o.-Baum: Setzliste, Freilose, Rundennamen, Platzierungen; Gruppenphase (Grand Slam)
js/majors.js          Majors/WS/PL: Qualifikation + Felder (state.qual), World-Cup-Teams, Premier-League-Tabelle
js/tournaments.js     Berechtigung, Meldung, Feld/Setzliste, Mehrfach-Events (sub), Preisgeld/OOM, KI-Hintergrundturniere
js/matchEngine.js     Schnelle Simulation (Aufnahme-basiert), für Sim-Modus + alle KI-Hintergrundmatches
js/board.js           Scheibengeometrie (mm), scoreAt(), targetPoint(), Checkout-Wege, suggestTarget()
js/matchState.js      Dartgenauer Match-Zustand (Bust, Double-Out, Legs/Sets, Stats) – serialisierbar
js/throwModel.js      KI-Dart (Gauß um Ziel, σ aus Attributen), Parameter fürs manuelle Zielen, wave()
js/matchUI.js         Screen 'match' (manuelles Spiel) – VORERST DEAKTIVIERT (MANUAL_AVAILABLE = false)
js/rankings.js        Order of Merits: addMoney(), orderOfMerit(), rankOf()
js/finance.js         Kontostand, Buchungen, Kosten pro Event
js/sponsors.js        Sponsoren: Angebote (alle 4 Wochen), Verträge, Zahlungen, Kündigung, Ablauf
js/history.js         Statistik-Archiv: Saisonbilanzen, Titel, Bestergebnisse, Höchstplatzierungen
js/news.js            Nachrichten-Feed
js/staff.js           Team: Manager (Provision in finance.book, Sponsor-/Gagen-Boni, Exhibition-Einladungen), Trainer (1 Jahr, XP-Faktor)
js/form.js            Bühne (Erfahrung zählt in Majors/gegen Top 16) + Selbstvertrauen/Momentum
js/rival.js           Rivale: Erzeugung, gezielt in lokale/DDV/WDF-Felder, Duelle/Bilanz, hält mit (Jahresende)
js/mishaps.js         Zufallsereignisse (Finger, Schule ≤ 18, Zahn, Rücken, Erkältung, Magen-Darm)
js/interviews.js      Interviews nach Majors (Floskel-Memory 5×5, Belohnung XP + Clutch)
js/distractions.js    Störmomente in der DartConnect-Simulation (planen, Chancen, auswerten)
js/ui/components.js   Toast, Modal, Spielerkarte, Tabelle, Header
js/ui/boardSvg.js     Dartscheibe als SVG (matchUI + Matchdart-Anzeige in watch)
js/ui/interview.js    Interview-Minispiel (Panel im Turnier-Screen und Hub)
js/ui/level.js        Level-Balken (animiert, Hub + Turnierende) und Level-Up-Fenster (afterMount im Router)
js/ui/screens/*.js    Screens: menu, create, hub, week, calendar, event, watch, finance, profile,
                      stats, news, rankings, tour (Holder + Titelträger), team (Manager/Trainer), rival, sponsors, settings, careerEnd, training
data/nations.js       Nationen + Flaggen
data/players.js       Spielerlisten: TOUR_TOP64 / TOUR_EXPIRING / TOUR_NEW_2026 (=128), Challenge 92 (62 Nutzerliste + 30 fiktiv), Dev 98 (Nutzerliste), Lokal 50
data/names.js         Namensbausteine für generierte Talente und den DDV-Pool
data/regions.js       16 Bundesländer mit Städten (lokale Turniere)
data/distractions.js  Störmoment-Situationen mit je 2 Optionen
data/staff.js         Manager (3 Stufen) und Trainer (3 Stufen), Exhibition-Orte
data/interviews.js    Interview-Floskeln
data/sponsors.js      Fiktive Sponsoren (3 Stufen), Vertragsplätze, Vertragsarten
data/tournaments.js   Jahreskalender (KW-basiert), Kategorien, Formate
data/prizemoney.js    Preisgeldtabellen in €
tests/run.mjs         Node-Tests (Regeln, Checkouts, Turnierablauf, Live-Match)
tests/*.mjs           Kalibrierung: calib (Sim), fitSigma/calibDarts (KI-Darts), humanSim (manuell), season
```
Start lokal: `python3 -m http.server` im Projektordner → http://localhost:8000 (ES-Module laufen nicht über file://).

## Datenmodell (Spielstand `state`)
```
version, slot, savedAt, rng:{s}, date:{year, week}
player: {id:'P', name, nation, region (Bundesland), hand, age, attrs:{sco,fin,men,foc,cal}, exp, clutch, level (1–100), xp (Rest im Level), xpTotal, pointsEarned, points,
         tour:'none'|'tour', cardUntil (letzte gültige Saison), qschoolYear (→ CT/Dev-Berechtigung), avgReal, everTourcard}
world:  {version:3, nextId, players:{id:{id,name,nation,age,avg,tier,cardUntil,cardVia,attrs,exp}}}   cardVia = Herkunft der Karte (auch player.cardVia)   tier: tour|challenge|dev|ddv|local
        IDs: R1=Rivale (rival:true), F=schwacher fiktiver CT/Dev-Pool, T=Top64, X=Karte Ende 2026 verloren, N=neu 2026, C=Challenge, D=Dev, V=DDV-Pool (63), L=lokal, G=generierte Talente
rankings:{seeded, years:{[year]:{challenge|dev|pdc|protour|eto|ws:{[id]:€}}}}   (2025/2026 = Startwerte PDC; eto/ws versteckt)
qual:   {[year]:{[eventId]:[Feld], wmAuto, wmqSurvivors, wcTeams}}   Felder ab Event-Woche fixiert
pl:     {[year]:{players:[8], points, legs, nights}}
week.extras: [eventIds]  Zusatz-Events der Woche (Premier League)
finance:{balance, tx:[{year,week,text,amount,cat}]}
week:   {played:bool, eventId}         aktuelle Woche
activeEvent: Turnier-Instanz oder null: {eventId, cat, sub/count (Teil-Turnier), rounds[{name,remaining,format,matches[{a,b,winner,score,bye}]}],
         stopAt (Q-School 4, ET-Quali 32), isQualifier, cards, oom:[Typen], place ('W','F',…,'CARD','QUAL','NQ'), hasNext, survivors, clutch,
         live:{m,me,mods:[{side,mult,visits}],dist:{id,atVisit,who,done}|null}|null}
champions:{[year]:[{week,eventId,name,cat,id,who,nation}]}  Sieger aller Turniere ab Karrierestart (ohne Lokal/Q-School/Quali/PL-Spieltage)
news:[{year,week,type,title,text}], results:[{year,week,eventId,name,cat,place,prize}]
stats:  {career:{...}, seasons:{[year]:{...}}}
training:{progress:{[attr]:0..1}, idle, sessions, lost}   week.activity = train|rest|sponsor|exhibition, week.trained = Attribut
player.levelSeen (zuletzt gefeiertes Level), player.fatigue 0–100, player.momentum −10…10, player.prep {key,bonus,weeks}, state.lastTrained;  live.route = {start, darts} (gewählter Checkout-Weg), live.coDec = {left, asked}
rival:{id,w,l,meetings:[{year,week,event,round,won,score}]}
staff:{manager:{…,cut,since,paid}|null, coach:{…,xp,until}|null, gigs:[{id,kind,city,fee,until}]}, interview:{event,place,tiles,seq}|null
sponsors:{active:[{name,slot,type,amount,years,start,until,paid}], offers:[{…,expires}], total}, ended:bool
archive:{seasons:{[year]:{…}}, titles:[], bests:{[key]:{place,year}}, peak:{pdc|challenge|dev:{rank,year,week}}}
```
Speicher: `localStorage['dartsCareer.slot.N']` (N=1..3), Auto-Save nach jeder Woche und nach jedem Turnier.

## Spielregeln (Kurzfassung Spezifikation)
- **Start**: Jahr 2027, KW 1, Alter 16, Budget 5.000 €, keine Tourcard, Bundesland wählbar (bei Nation DE). Alle Attribute 60 + **25 Bonuspunkte** frei verteilbar bei der Erstellung (1 Punkt = +1, max. 85 je Attribut; Start erst wenn alle verteilt; `startAttrs(bonus)`), Erfahrung −4.
- **Attribute** (1–100) sind **Perzentile**: „stärker als X von 100 Dartspielern“ – nicht der Average.
  - Scoring (sco) → Average über Kurve `AVG_CURVE` (40→53, 60→65, 80→79, 90→89, 95→95, 99→103, 100→106 Ø).
  - Finishing (fin) → Checkout-Basis 6 % + 0,37 %·fin (60 → 28 %, 100 → 43 %).
  - Mental (men) → Druck bei Matchdarts/Entscheidungslegs. Fokus (foc) → Konstanz, Tagesform, Ausdauer, Störmomente.
  - Rechnen (cal) → Fehlerquote `calcError` = (100 − cal)·0,3 % (60 → 12 %): Stelldarts auf Bogey-Zahlen (159/162/163/165/166/168/169), falsches Doppel (Bust/kaputter Rest), falsche Wege (Checkout-Chance × (1 − 0,6·ce)). Dart-Modell: `maybeMiscalc` in throwModel. Stat `bogey` (Aufnahmen, die auf Bogey enden), im DartConnect mit ⚠ markiert. Rechnen 40 vs 95 ≈ 40 % Siegchance.
  - Gesamt = 0,36·sco + 0,27·fin + 0,13·men + 0,13·foc + 0,11·cal.
- **Erfahrung** (exp, −4 … +10): Clutch-Faktor. Matchdarts: Sim-Checkout × (… + 0,025·exp); Dart-Modell σ × (1 − 0,025·exp); Entscheidungsleg-Scoring ±0,6 %/Stufe. +10 vs −4 bei gleichen Werten ≈ 60 % Siegchance. Wächst über Clutch-Punkte (Match 2, Entscheidungsleg +3, gewonnen +3, × Kategoriefaktor); Schwellen `EXP_STEPS`. KI: nach Ebene/Alter, jährlich +1 (Chance).
- **XP/Training**: Match 10, Sieg +15, +6 je Runde (max 6), Titel/Karte +40, **Teilnahme +45**, × Faktor (lokal 0,55, DDV 1,4, CT/Dev/Q 1, PC/ET 1,5, Majors 2). **Level 1–100** (Start Level 1, 0 XP): Aufstieg L → L+1 kostet `xpForLevel(L)` = 50·L·(1 + 2·((L−1)/99)²) XP (gerundet auf 10: 50, 100, 150 … L50 ≈ 3.750, L99 = 14.650; Summe bis L100 ≈ 491 Tsd.), je Aufstieg **5 Attributpunkte**, max. 495. Kosten je Stufe: 1 (<70), 2 (70–84), 3 (85–94), 4 (≥95). Training direkt nach jedem Turnier (Panel im Turnier-Screen) oder im Profil.
- **Training** (`training.js`): 1 Einheit pro Woche (zusätzlich zum Event, kostenlos) auf ein Attribut. Bringt (a) **XP** = 3 % von `xpForLevel(level)` × Qualität (0,7/1/1,3), mind. 10 (`trainingXp`); (b) **Turniervorbereitung** `player.prep = {key, bonus:3, weeks:2}` → +3 auf das Attribut in `perf` für Turniere dieser + nächster Woche; (c) langsamen Dauer-Fortschritt: +1 nach 5 × Attributkosten Einheiten (60 → 5, 75 → 10, 90 → 15, 95+ → 20). Ohne Training: ab 4 Wochen Pause pro Woche Risiko 10 % (+5 %/Woche, max. 30 %) auf −1 bei einem Attribut (gewichtet nach Höhe², nicht unter 50). Bot-Balancing: mit Training Tourcard nach 5–6 Saisons/Top 20 nach 8; ohne Training Stagnation bei Gesamt ~67–70.
- **Wochenplan**: genau EINE Aktivität pro Woche (zusätzlich zum Turnier): Training · Ruhetag (Ermüdung −30) · Sponsortermin (nur mit aktivem Vertrag; je Sponsor 4 % Jahresgehalt / 60 % Antrittsgeld / 30 % Bonus, mind. 150 €) · Exhibition (mit Karte 500 € + 2 % Marktwert, sonst 200 €, ±20 %; XP = 5 % des Level-Bedarfs, +3 Clutch, Ermüdung +20).
- **Ermüdung** (player.fatigue 0–100): +4 je gespieltem Match +4 Reise (nicht lokal), −10 pro Woche. **Erholung kaufen** (Wochenplan, zusätzlich zur Aktivität, je 1× pro Woche): Sauna −10 %, Massage −15 %, Preis 50–100 € (je Woche fest, `recoveryPrice`); `week.recovery`. Über 30 %: Leistung sinkt linear bis 100 % (−6 Scoring, −8 Fokus, −4 Finishing; nur in `perf`).
- **Sprung** „⏭ Nächstes Event“ (`jumpToNextEvent`): überspringt Wochen bis zu einem spielbaren Nicht-Lokal-Event (max. 20), trainiert dabei automatisch (zuletzt trainiertes bzw. schwächstes Attribut); 0 Wochen, wenn diese Woche schon eins ansteht.
- **Kalender**: ISO-KW 1–52 (KW 53 wird übersprungen). Pro Woche max. ein Event. „Weiter“ → nächste Woche.
- **Kosten**: Anmeldegebühr 25 € (Q-School, Challenge, Dev). Reise: England/UK 600 €, Deutschland 250 €, sonst 400 €. Lokal: kostenlos, keine Reise. Melden nur bei genug Budget.
- **Lokale Turniere**: jede Woche außer KW 52, nur im eigenen Bundesland (Städte aus `data/regions.js`), 16 Spieler, immer best of 5 (first to 3, auch im Finale) (fiktiv, nur Deutsche, Listenwert − `LOCAL_SHIFT` 6 → Ø 54–74), Siegprämie zufällig 50–200 €, Finalist 40 %, Halbfinale 20 %.
- **DDV-Ranglistenturniere**: 4 pro Jahr (KW 9, 20, 33, 44), nur ohne Tourcard, 64 Spieler (DDV-Pool ~66–88 Ø), Gebühr 25 € + Reise DE 250 €, Preisgeld Sieg 350 €, Finale 100 €, XP-Faktor 1,4.
- **WDF-Opens** (Kategorie `wdf`, nur ohne Tourcard): 17 Events nach WDF-Kalender 2026, max. 1 pro Woche (KW 3 Las Vegas … KW 47 Czech Open; Liste `WDF` in data/tournaments.js), Kategorie Platinum/Gold (128er-Feld) bzw. Silver/Bronze (64). Feld = zufällige Auswahl aus Spielern ohne Karte + DDV-Pool, keine Setzliste, first to 4, ab Viertelfinale 5, Finale 6. Preisgeld: Sieg 1.000–2.500 € (Band je Kategorie: Platinum 2.200–2.500, Gold 1.700–2.200, Silver 1.300–1.700, Bronze 1.000–1.300; je Event+Jahr fest, `wdfPrize`), Finale 500, HF 250, VF 100 €. Keine Gebühr; Reise Europa 400 €, Übersee 1.000 €. **XP-Boost** zufällig ×1,2–1,6 je Turnier (`inst.xpBoost`, 0,05-Schritte, ersetzt den Kategoriefaktor für XP + Clutch), keine OOM; KI-Ausgaben laufen im Hintergrund (Titelträger).
- **Tour-Struktur (Phase 3 umgesetzt)**:
  - Tourcard gilt 2 Jahre. Am Saisonende: PDC-OOM Top 64 → `cardUntil = max(cardUntil, Jahr+1)` (+1 Jahr); auslaufend und außerhalb Top 64 → Verlust.
  - Start 2027: 2026er Top 64 (bis 2027) + 33 Neue 2026 (Q-School 2026 + CT/Dev 2025, bis 2027) + je Top 2 CT/Dev 2026 (= Listenplatz 1–2: Hunt, Coulson / Drayton, Beeton; bis 2028) = 101 Karten; 31 Holder im zweiten Kartenjahr verlieren die Karte → Q-School.
  - Q-School KW 2: UK (Milton Keynes, Nationen UK/IRL/AUS/USA…) und EU (Kalkar, Rest). Je 4 Tage, jeder Tag K.-o. ohne Setzliste, first to 5; wer das Halbfinale erreicht (letzte 4) → Tourcard bis Ende Folgejahr. Kartengewinner fehlen an späteren Tagen. Teilnahme → CT-Berechtigung (+ Dev bis 23) für das Jahr.
  - **Anzahl wählbar** (`pick: true` bei CT/Dev/HNQ): bei der Meldung 1–max Turniere, Gebühr 25 € je gespieltem Turnier (`eventCost(ev, n)`, `week.playCount`); die übrigen laufen im Hintergrund.
  - **Host-Nation-Qualifier** (`hnq`, Woche vor jedem ET-Event, Land = ET-Land): nur ohne Tourcard und Nation = Gastgeberland (Deutsche → 7 deutsche ET-Events), bis zu 4 Turniere (Feld 64: Spieler ohne Karte/DDV/lokal dieser Nation, first to 4, Finale 5, kein Preisgeld). Turniersieg → `state.hnq = {etId, year}` → ET-Hauptfeld (ersetzt einen der 32 Qualifikanten), restliche Gebühren werden erstattet.
  - Challenge Tour: 5 Wochenenden × **5 Turniere** (KW 11/19/29/37/42; Dev KW 14/22/32/39/43; `TOUR_WEEKEND_EVENTS`), Feld = alle ohne Karte (Challenge+Dev) + Spieler, Setzliste nach CT-OOM, Freilose. Dev Tour analog nur ≤ 23. Preisgeld je Turnier (beide): Sieg 3.000, F 2.000, HF 1.000, VF 750, L16 350, L32 250, L64 100 €. Dev-Niveau 4 Ø unter CT (Dev-Liste abgesenkt, außer `DEV_AT_CT_LEVEL`); schwacher fiktiver Pool F1–F90 (50 Dev 64–72 Ø, 40 CT 68–75 Ø, `addWeakPool`); Pool-Obergrenze ohne Karte 300; neue Talente 70–82 Ø. Youth-WM (KW 45) zählt nicht zur OOM.
  - KI-Events laufen im Hintergrund (season.nextWeek → simulateWeekAI), Preisgeld → OOM.
  - Jahresende: CT-OOM Top 2 + Dev-OOM Top 2 (ohne Karte, Preisgeld > 0) → Karte bis Jahr+2. PDC-OOM-Rang ≤ 64 → Karte +1 Jahr, auslaufend außerhalb → Verlust → Challenge. Danach developWorld: Stärke nach Alter (jung +, alt −), Ruhestand ab 45 (tier 'retired', bleibt für Historie), jährlich ≥ 12 Talente (16–18 J.), Dev-Pool ~90; Pool ohne Karte max. 200 (schwächste Challenge-Spieler ab 26 hören auf). Neujahr: Alter +1, Dev ab 24 → Challenge.
  - Tourcard-Holder nicht auf Challenge; Dev Tour nur Holder ≤ 23 außerhalb der PDC-Top-64 (`devHolders`, auch du – ohne Q-School-Pflicht). Dev-OOM-Karten gehen nur an Spieler ohne Karte.
- **Pro Tour (Phase 4 umgesetzt)**, nur mit Tourcard:
  - Players Championships: 15 Doppel-Blöcke (30 Turniere), Feld = bis 128 Tour-Holder nach PDC-OOM, freie Auslosung, first to 6. Preisgeld 17.500 € Sieg … 1.150 € Letzte 64.
  - European Tour: 14 Events als 2-teiliger Block: Qualifikation (alle Holder außer PDC-Top-16, 128er-Baum bis 32 Überlebende, kein Preisgeld) → Hauptfeld 48 (Top 16 gesetzt mit Freilos, 32 Qualifikanten), first to 6, HF 7, F 8. Preisgeld 35.000 € … 1.500 € (Letzte 48). Spieler in den Top 16 → direkt Hauptfeld (Quali läuft im Hintergrund).
  - Preisgeld PC/ET → PDC OOM (2 Jahre) + Pro Tour OOM (1 Jahr). Startwerte: Saisons 2025/2026 vorbelegt (Top 64 ≈ 2,8 Mio. € · Rang^−0,8; übrige 2026er Holder 12–150 Tsd. €).
  - PC/ET laufen ohne Spieler im Hintergrund (AI_CATS) → Top-64-Entscheidung am Jahresende nach echtem Preisgeld.
- **Majors & Events (Phase 5 umgesetzt)** – Feld wird in der Event-Woche aus den Ranglisten berechnet (`majors.js`); wer qualifiziert ist und nicht meldet, wird durch einen Nachrücker ersetzt (PL/World Cup: automatisch mitgespielt).
  - Masters (KW 5): Top 24 PDC, Top 8 Freilos. UK Open (KW 10): alle Holder + Top 32 CT-OOM (auch du ohne Karte), Setzliste nach PDC.
  - World Matchplay (KW 29) & World Grand Prix (KW 40, Sätze; Double-In vereinfacht weggelassen): Top 16 PDC + Top 16 Pro Tour.
  - European Championship (KW 42): Top 32 der ET-Wertung (Preisgeld ET-Hauptfelder). PC Finals (KW 48): Top 64 Pro Tour.
  - Grand Slam (KW 46): Top 16 PDC + 8 Pro Tour + Top 2 CT + Top 2 Dev + 4 Pro Tour; 4 Töpfe → 8 Gruppen à 4 (first to 5), Top 2 → Achtelfinale (A1–B2 …). G3/G4 Preisgeld.
  - **WM-Qualifier Q-School** (`wm-qs`, Kategorie `wmqs`, KW 46): alle Q-School-Teilnehmer des Jahres ohne Tourcard (KI: Pool ohne Karte), K.-o. ohne Setzliste, first to 5, ab HF 6, kein Preisgeld; Sieger (`qual.wmQsWinner`) bekommt einen WM-Platz (vor den International-Plätzen). Läuft auch im Hintergrund.
  - WM-Quali (KW 49): Holder ohne direkten WM-Platz, 16 Tickets. WM (KW 51–52, Sätze): Top 40 PDC + 40 Pro Tour + 16 Quali + CT Top 4 + Dev Top 4 + 24 International (stärkste ohne Karte, auch du) = 128.
  - World Cup (KW 24): je Nation die 2 Besten (Tour + Challenge), Team-Werte = Durchschnitt, Preisgeld je Team (dein Anteil 50 %), keine OOM.
  - World Series (8 Events): Top 8 PDC + 8 Qualifikanten (PDC 9–64 zugelost); Finals: Top 24 WS-Wertung. Keine PDC-OOM.
  - Premier League: Top 8 PDC zu Saisonbeginn, 16 Spieltage (KW 6–21) als **Zusatz-Event** (zählt nicht als Wochen-Event), K.-o. first to 6, Punkte 5/3/2/2; Play-offs KW 22 (Top 4). Keine OOM.
  - Majors-Preisgeld → PDC OOM (nicht Pro Tour). Alle Majors laufen im Hintergrund (AI_CATS).
- **Team** (`staff.js`): **Manager** ab erster Tourcard (Stufe 2 ab Top 64, Stufe 3 ab Top 16): Provision 10/15/20 % auf alle Einnahmen (Preisgeld, Sponsoren, Exhibitions; zentral in `book`), dafür Sponsor-Angebotschance 75/90/100 % (statt 60 %), Beträge +10/25/45 %, mehr offene Angebote, Exhibition-Gagen ×1,2/1,5/2 und **Exhibition-Einladungen** (20/30/40 % pro Woche, zusätzlich zum Wochenplan, reines Klick-Event: Gage, XP, Clutch +2, Ermüdung +15). **Trainer**: Einmalzahlung 1.500/6.000/18.000 € für 52 Wochen → alle XP ×1,1/1,2/1,3 und schnellerer Trainingsfortschritt.
- **Bühne** (`form.js`): in Majors/WS/PL (Faktor 1, ab Viertelfinale 1,5) und gegen PDC-Top-16 (0,7) zählt Erfahrung: ±0,5 × Faktor je Stufe über/unter +3 auf Scoring, Finishing, Mental (beide Seiten, in `attrsOf`). Anzeige „🎭“ im DartConnect.
- **Selbstvertrauen** (`player.momentum` −10…10): Sieg +1 (gegen Stärkere/Top 16 +1,5), Niederlage −1 (gegen Schwächere −1,5, gegen Stärkere −0,4), lokal ×¼; Titel (nicht lokal) +3; wöchentlich −20 % und 0,3 (negativ 0,6) Richtung 0. Ab ±3: ±1,5/±3/±4 auf Scoring, Finishing, Fokus (`perf`). Anzeige im Hub-Kopf, Profil, DartConnect (🔥/🥶).
- **Interviews** nach Majors (außer WM-Quali), PL-Play-offs, WS-Finals: Chance Sieg 100 %, Finale 80 %, HF 60 %, VF 40 %, sonst 25 %. 25 Floskeln im 5×5-Raster, 4–5 (Sieg 6) leuchten nacheinander grün auf, dann in Reihenfolge antippen; richtig → XP (12 % Level-Bedarf × Länge/5, mind. 30, × Trainer) + 3 Clutch je Floskel; ein Fehler beendet es. Anfrage verfällt nach der Woche.
- **Rivale** (`rival.js`): beim Karrierestart ein gleichaltriges Talent gleicher Nation (Name aus Namenspool), Stärke ≈ dein Gesamtwert (+0–1,5 Ø), Tier Dev/Challenge wie alle ohne Karte (spielt CT/Dev/Q-School im Hintergrund, kann Karten gewinnen, hört nie wegen Pool-Grenze auf). Kommt gezielt ins Feld: lokal 40 %, DDV 80 %, WDF 50 % (nur ohne Karte). Duell → Bilanz, News, Selbstvertrauen +1 (Sieg) / −0,5 (Niederlage) zusätzlich; Banner „⚔️ Rivalen-Duell“ im DartConnect. Titel/Tourcard des Rivalen → News. Jahresende: zieht 50 % Richtung deines Niveaus (Ø aus Gesamtwert) ± Zufall + Saisonduell-News. Screen 'rival' (Vergleich, Duelle), Hub-Kachel.
- **Zufallsereignisse** (`mishaps.js`, zu Wochenbeginn, 7 %): 75 % Trainingsrückschlag (Fortschritt von 1–2 Attributen −30…60 %-Punkte), 25 % Ausfall → `week.blocked`, alle Turniere der Woche gesperrt (Hinweis im Hub). „Schulische Verpflichtungen“ nur bis 18.
- **Rankings**: PDC OOM (rollierend 2 Jahre), Pro Tour OOM, Challenge OOM, Dev OOM, Premier-League-Tabelle.
- **Sponsoren (Phase 6 umgesetzt)**: erst nach erster Tourcard. 4 Plätze (Darts-Ausrüster, Trikot, Getränk, Partner), je einer aktiv. Angebote alle 4 Wochen (60 %, max. 3 offen, 6 Wochen gültig). Marktwert = 250.000 € · PDC-Rang^−1,1 (+2 % je Titel, 600–400.000 €). Typen: Jahresgehalt (quartalsweise KW 1/14/27/40, erste Rate bei Unterschrift), Antrittsgeld je Profi-Turnier, Erfolgsbonus ab Halbfinale (Titel ×3). Laufzeit 1–3 Jahre (Top 16 bis 3, Top 64 bis 2), Sponsorstufe nach Rang. Kündigung jederzeit ohne Kosten.

## Match-Engine
- Format: `{legs:n}` = first to n Legs; `{sets:s, legs:l}` = first to s Sets, je first to l Legs. 501, Double Out.
- Simulation aufnahmebasiert: Scoring-Aufnahme ~ Normal(avg·Form, sd(con)), 180er-Chance aus avg; Finish-Bereich (≤170, keine Bogey-Zahlen) mit Wahrscheinlichkeit aus Checkout-Basis × Restpunkt-Faktor; ≤50 dartgenau auf Doppel.
- Stats: Average (Punkte/Darts·3), 180er, 140+, 100+, Checkout-% (Treffer/Doppelversuche), höchstes Finish.
- **Spielmodi im Turnier**: 📺 DartConnect (Screen 'watch', Zuschauen mit Störmomenten) und ⚡ Schnellsimulation (sofort). Manueller Modus vorerst deaktiviert.
- **Checkout-Entscheidungen** (nur DartConnect, `decisions.js`): vor einer eigenen Aufnahme auf 41–170 (kein Bogey) mit 30 % Chance, max. 2 je Match. immer **3 Wege** (`alternativeRoutes`, sonst keine Entscheidung) in gemischter Reihenfolge, angezeigt **nur die Wege**. Ausgang steht fest (`buildOptions`, Skript in `live.route.script`, `scriptedHit`): bester Weg (höchste Monte-Carlo-Chance mit eigenen Werten) → **Check**; zweiter → **sauber runtergespielt** (Stelldarts sitzen, Doppel-Darts daneben → Rest = Doppel ≤ 40; Bull-Rest wird per Single auf ein Doppel gestellt); dritter → **sehr schlechte Aufnahme** (kleinere Nachbar-Singles, Doppel daneben → krummer Rest oder Bust). „★ Empfohlen“ (= Check-Weg) ab Rechnen 75.
- **Gegner-Matchdarts** (nur DartConnect): steht der Gegner zu Beginn seiner Aufnahme auf einem Match-Finish (≤ 170, kein Bogey), erscheint die Dartscheibe als Overlay und die Darts kommen einzeln (1,1 s) mit Zielfeld und Treffer (`liveDartStep`, `oppMatchDartVisit`).
- **Störmomente** (nur DartConnect, vor einer eigenen Aufnahme): Wahrscheinlichkeit je Match lokal 50 %, DDV 35 %, sonst 25 %. Situationen je Ebene (Quatschen/Handy nur lokal; Zwischenruf/Zeitspiel DDV+Pro; Auspfeifen nur Pro). 2 Optionen: sicher (höhere Chance, kleiner Effekt) vs. riskant (niedrige Chance, großer Effekt). Chance = base + (Attribut−60)·0,6 % + Erfahrung·1,5 % (10–92 %). Effekt = Streuungs-Multiplikator für n Aufnahmen (eigene oder gegnerische Seite), Anzeige 😤/🔥 im Scoreboard.
- **Manueller Modus** (`matchUI.js`, deaktiviert – Parameter noch auf alter Attribut-Skala): Ziel wählen (Tippen auf Scheibe / Chips, Standard = `suggestTarget`: T20 bzw. Checkout-Weg) → „Werfen“ → vertikale Linie (x) stoppen → horizontale Linie (y) stoppen → Treffer = Schnittpunkt + Gauß-Reststreuung. Bedienung: Tippen, Button oder Leertaste.
  - Linienposition = Ziel + amp·wave(Startphase + t·freq), t aus `performance.now()` → frameunabhängig. amp = 66 − 0,48·sco (mm), freq = 0,75 + 0,6·(1 − sco/99) Hz (y-Linie ×1,13), Reststreuung = 12 − 0,085·con mm.
  - (Hinweis: KI-Attribute haben 1 Nachkommastelle für feine Auflösung an der Spitze; Anzeige gerundet. Tagesform-σ = 0,055 − 0,0003·foc.)
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
