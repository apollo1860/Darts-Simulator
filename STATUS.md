# STATUS – New Star Darts (ehem. Darts Career)

## Umbau zu New Star Darts (Etappen, Spezifikation in CLAUDE.md)
- [x] **Version 36**: ET – Aus in Runde 1 („Letzte 48“) zahlt 2 ★ Basis (real 2.000 £) auch dem Spieler (vorher 0). Echte OOM-Regel umgesetzt (`inst.preQual` = Gesetzte + Pro-Tour-Qualifizierte): wer darüber vorqualifiziert ist und sein erstes Match verliert (Gesetzte in Runde 2, Pro-Tour-Spieler in Runde 1), bekommt das Geld, aber keine OOM-Punkte; TCHQ/HNQ/Nordic-Baltic/Osteuropa werden immer gewertet. Andere Events: „erstes Match verloren = 0“ für den Spieler unverändert.
- [x] **Version 35**: Abgleich mit echtem ET-Event (International Darts Open 2026, Riesa): Feldaufbau war schon gleich (48 = 16 Gesetzte PDC-OOM ab Runde 2 + 16 Pro-Tour-OOM + 10 TCHQ + 4 HNQ + Nordic & Baltic + Osteuropa; Runde 1 mit 16 Spielen, R2 16, AF 8, VF 4, HF 2, F 1; first to 6 / HF 7 / F 8). Neu: Preistabelle exakt 35/15/10/8/5/3,5/2 Tsd. (230 Tsd. gesamt, `STAR_PRIZE_FIXED`, auch €-Tabelle), 1. Runde heißt „Letzte 48“ (`placeLabel(place, cat)`), **Absagen** (`etWithdrawn`, 6 % je direkt Qualifiziertem, fest je Event; Nachrücker über PDC-/Pro-Tour-OOM). Offen: Regel „vorqualifizierte Spieler ohne OOM-Geld bei Aus im ersten Match“ (Geld wird gezahlt, zählt aber nicht für die OOM) ist nicht umgesetzt – bisher gilt für den Spieler „erstes Match verloren = 0 ★“.
- [x] **Version 34**: (1) Startliste PDC Order of Merit 2026 = echte Gesamtliste (`START_OOM_2026` in data/players.js, Tsd. £ = ★, Plätze 1–64 = T, 65–95 = X; Neu-2026-Spieler 0 ★; Spieler startet auf Platz 129). 2-Jahres-Wertungen (PDC, Pro Tour, ET, PC) zählen jetzt wie echt: Vorjahr voll, das Jahr davor läuft im Lauf der Saison aus (KW 3 100 % → KW 52 0 %, `oldYearWeight`) – zum Saisonende zählen genau 2 Saisons. Seed-Aufteilung 40 % (Vor-Vorjahr) / 60 % (Vorjahr). (2) Eigene Illustrationen für den Lifestyle-Shop (`js/ui/nsd/art/`: items, vehicles, homes, `lifeArt(id)`): 22 Gegenstände + 22 Fahrzeuge als Kachel, 18 Immobilien als Szene.
- [x] **Version 33**: Weiter-Pfeil und ✔-Button sind eigene SVG-Grafiken (`arrowIcon()`/`checkIcon()` in frame.js: grüner Glanzverlauf, dunkle Kontur, wie Vorlage) statt Emoji – in allen Screens; „Zurück“ nutzt den gespiegelten Pfeil.
- [x] **Version 32**: Untere Leiste (Start/Weiter/✔ …) immer sichtbar – Rahmen hat genau Bildschirmhöhe, der Inhalt darüber scrollt (kleine Displays: Deko oben/unten schmaler). Website-Artikel auf „darts-news.de“ (`js/articles.js`, Warteschlange `state.articles`, max. 4) bei Titel, verlorenem Major-/WM-Finale, WM-Ticket, erstmals PDC Top 64/32/16/8/1, Neun-Darter, Star-Status alle 5 Stufen, Premier-League-Einladung, Tourcard verloren/zurück/Karriereende; Anzeige nach dem Turnier, Interview oder Wochen-Update.
- [x] **Version 31**: Darts-Arena statt Fußball-Optik (dunkle Halle, Lichttraverse mit Scheinwerfern, LED-Bande, Bühne mit Spot/Lichtkegeln und Scheiben-Ringen, Titelbild mit Bühnenboden + Oche statt Rasen, dunkle Modals); eigene SVG-Grafiken für Flights (Farbe nach Stärke: blau/grün/rot, Premium gold) und Barrels im Zubehör-Shop; Menüpunkt „Liga“ heißt jetzt „Ranglisten“.
- [x] **Version 30**: Pro-Tour-, European-Tour- und Players-Championship-OOM zählen jetzt rollierend 2 Jahre (wie PDC-OOM) und sind für 2024/25 vorbelegt (≈ 40 / 15 / 25 % des PDC-Preisgelds je Holder, ±40 %). Challenge/Dev bleiben 1 Jahr.
- [x] **Version 29**: Sponsoren nur mit Manager. Kneipen-Kumpel 8 %/Woche, Beträge ×0,7, nur Stufe-1-Sponsoren; Stufe 2: 25 %, ×1,4, bis Stufe 2; Profi: 50 %, ×2,5, alle Sponsoren (Fans erhöhen die Chance leicht).
- [x] **Version 28**: Zubehör-Preise = Niveau Version 26 + 50 % (Flights ~12/30/40, Premium 80–100, Barrels ~15–45 Basis-★).
- [x] **Version 27**: Flights boosten alle Fähigkeiten in klaren Stufen (3–6 / 10–15 / 20–25 je Fähigkeit, 3–4 Matches) + Premium-Flight (+35 auf alle, 5 Wochen, ~1.300 Basis-★); Fähigkeiten max. 60; Barrels gezielt und günstiger.
- [x] **Version 26**: Zubehör-Angebot je Spielstand zufällig aus Namenspools (Flights/Barrels), wechselt alle 12 Wochen (Namen, Boosts 2–9 Punkte, 3–6 Matches), teurer (≈ Punkte × Matches × 0,6 + 3 Basis-★).
- [x] **Version 25**: Zubehör neu: 3 Flights (Falcon Glide, Viper Fang, Phantom Stealth) + 3 Barrels (Thunder Hammer, Ice Scalpel, Black Titan).
- [x] **Version 24**: Zubehör-Shop (Status → Shop): 10 Artikel (Flights, Shafts, Grip-Wachs, Glücks-Cap, Spickzettel, Trikot, Leih-Darts, Profi-Set) mit Fähigkeits-Boost für 2–8 eigene Matches (`player.boosts`, `useBoosts`); Lifestyle-Shop nur noch über Leben.
- [x] **Version 23**: ★ wieder nur ganze Zahlen: Preise ab Stufe 2 aufgerundet (Bier/Rubbellos 2 ★).
- [x] **Version 22**: Editor (Screen `editor`, über 🛠️ im Status-Screen oder Optionen): Sterne-Geld, Star-Status, freie Punkte, Fähigkeiten, Energie, Zufriedenheit, Beziehungen, Alter, Tourcard.
- [x] **Version 21**: Preise steigen mit jeder Star-Stufe sichtbar (+5 %, auf 0,1 ★ gerundet – Bier Stufe 2 = 1,1 ★); Kontostand mit einer Nachkommastelle.
- [x] **Version 20**: Liga: eigene Zeile wird immer angezeigt (PDC-OOM zeigte nur die Top 128, als Neuling mit Platz ≥ 129 fehlte man).
- [x] **Version 19**: Rubbellos-Jackpot 5 % (statt 10 %).
- [x] **Version 18**: Je Star-Status-Stufe 1 freier Fähigkeitspunkt (Fähigkeiten-Screen ＋); Match-Note wohlwollender (Ø ≥ 90 oder besserer Ø als der Gegner → mind. 6,0, Sieg mind. 5,5); Sponsor-Verhandlung mit Darts-Flight 1–10 (max. 5×, Treffer +8 % auf alle Prämien, jeder Versuch −1 Sponsor-Zufriedenheit, Fehler → Anfangsangebot + genervter Sponsor), Verträge mit Wochenhonorar, Siegprämie, teils 180er-/Major-Prämie.
- [x] **Version 17**: Startguthaben 15 ★ (statt 5).
- [x] **Version 16**: World Cup im echten Format (Gruppe Bo7, Achtelfinale–Halbfinale Bo15, Finale Bo19) und als Doppel: die Partner werfen abwechselnd auf einen Score, der Bessere beginnt jedes Leg (Sim + Liveticker, Schlüsselmomente nur bei eigenen Aufnahmen); Zoom-Knopf zeigt jederzeit das Viertel um das Ziel (Standard aus); Star-Status-Balken wächst sichtbar mit Leuchten (Status, Spielbericht, Turnier); Tourcard-Anzeige „bis Ende 2027“ / „für 2 Jahre (2026 und 2027)“.
- [x] **Version 15**: World Cup (KW 24) mit 40 Nationen (Europa 25, Asien 9, Nordamerika 2, Ozeanien 2, Afrika 1, Südamerika 1), Top 4 direkt im Achtelfinale, 36 Teams in 12 Dreiergruppen (Gruppensieger weiter), fehlende Spieler = schwache fiktive Amateure; Preisgeld weiter ohne OOM.
- [x] **Version 14**: Pools African Darts Group (7, Kenia/Uganda) und CDLC (7, Karibik/Lateinamerika) mit Nutzer-Average ±15 % Spielraum je Karriere; neue Nationen (u. a. Uganda, Bahamas, Trinidad und Tobago, Guyana).
- [x] **Version 13**: WM-Qualifikanten nach der echten Liste 2026 (Jugend-Weltmeister, Dev/CT Platz 2–4, Women's Series 2–5, 21 Qualifier mit 22 Plätzen, Asian Tour 5, PDCNB Pro Tour 2, CDC bester US-Amerikaner/Kanadier, ADA 1, DPNZ 1, Tour Card Holder Qualifier 4); Spieler der Liste in die Nebentour-Pools aufgenommen.
- [x] **Version 12**: WM-Plätze exakt nach Nutzerliste (48 = Nebentouren 7, Frauen 4, Asien & Ozeanien 11, Europa 8, Amerika 5, Afrika 2, PDPA Qualifier 11).
- [x] **Version 11**: WM-Plätze neu: Top 40 PDC + Top 40 Pro Tour, CT/Dev Top 2 (ohne Karte) + Jugend-Weltmeister, Frauen 2 (Women's Series) + 2 (Women's World Matchplay), Affiliate-Touren direkt über die Tour-OOM (Asien 6, CDC 4, Nordic & Baltic 3, DPA 2, DPNZ 1), Qualifier Super League, Benelux, Süd-, Ost-, Mitteleuropa, Japan, China, Indien, CDLC, Afrika (2); Rest PDPA Qualifier (meist ~14). Q-School-WM-Qualifier entfernt.
- [x] **Version 10**: UK Open mit gestaffeltem Einstieg (Runde 1: ab Platz 97 + 8 CT + 8 Dev + Riley's-Amateure, Runde 2: 65–96, Runde 3: 33–64, Runde 4: Top 32) und offener Auslosung ab Runde 4; Grand Slam nach TV-Finalisten (12 Monate), Pro-Tour-Titeln, Nebentouren und neuem Tour Card Holder Qualifier (KW 45); PC Finals über eigene Players-Championship-OOM.
- [x] **Version 9**: Eigene Spielerpools für die Nebentouren (Women's Series, Asian Tour, CDC, DPA, DPNZ, Nordic & Baltic, Osteuropa; je Top 8 der Vorjahres-OOM, Ø nach Platz) – genutzt in Masters-Vorrunde, Grand Slam (2 Plätze Women's Series), WM- und ET-Regionalqualifiern.
- [x] **Version 8**: Winmau World Masters mit echter Vorrunde (Gruppenphase, K.-o. gegen Platz 25–56, 8 Qualifikanten, Best of 5 Sets); Version steigt ab jetzt mit jedem Push.
- [x] **Version 7.4**: Zoom-Hilfe direkt am Board per Knopf „🔍 Zoom an/aus“ (statt in den Optionen).
- [x] **Version 7.3**: Lifestyle-Shop mit 62 Artikeln laut Nutzerliste (Gegenstände, Fahrzeuge, Immobilien bis Burj Khalifa), Fitnesstrainer als Festpreis-Pakete mit alle 12 Wochen wechselnden Angeboten, Zoom nur beim echten Checken.
- [x] **Version 7.2 – Bot-Langzeittest** (`tests/nsdCareer.mjs`): 15 Saisons ohne Fehler; Star-Status-Kurve flacher (1,04^Stufe, Gewinne +1 %/Stufe), Fans wachsen abnehmend. Ergebnis (gut trainierender Bot): Jahr 1 Rang ~129, Jahr 2 Top 20–100, ab Jahr 3 Weltspitze, Status 100 nach ~13 Jahren; wer im 2. Jahr nicht in die Top 64 kommt, muss in die Last Chance. Spät im Spiel häufen sich ★ ohne neue Kaufziele (offen).
- [x] **Version 7.1**: Meilensteine ohne Geld (kleines Star-Status-Plus), Einblendung im NSS-Stil, eigenes App-Icon (Homescreen/Favicon).
- [x] **Version 7 – Feedback-Runde**: Start 2026 nach der Q-School mit echter Holder-Liste, Masters-Vorrunden, 5 ★, Alter bis 60 mit Abbau ab 30, Zielen-Bug behoben (Wurf-Knopf unten), Zoom-Hilfe, Gegnerstand/-Matchdarts, Scoring-Momente, Rechenfehler, leichterer Start, neue Star-Status-Regeln, Zufriedenheit langsam, Beziehungs-Aktionen, Ereignisse ±2/60 % Energie, Getränke auf 100 %, Fokus-Memory neu, 133 Meilensteine mit Einblendung.
- [x] **Etappe 1 – Grundgerüst & Design**: NSS-Look (Glasdach, eigene Pixel-Zuschauer, graue Glanz-Buttons, grüner Rasen), Titelbildschirm, Spielstände, Optionen (Export/Import), Willkommen, Profil erstellen, Karrierestart mit Tourcard (`newNsdCareer`), Hauptscreen Status, Fähigkeit (0–60), Leben (Beziehungen, Erfolge), Liga (PDC/Pro-Tour-Rangliste). „Spielen“ führt vorerst in den alten Wochenplan bzw. zur nächsten Woche.
- [x] **Etappe 2 – Spielen**: Wochenansicht (Melden, Weiter +40 % Energie), Turnier-Lobby (VS, Spielen/Simulieren, Ergebnis mit ★ und Star-Status), DartConnect-Liveticker mit Kommentarzeile, Schlüsselmomente selbst werfen (Matchdarts, Entscheidungsleg, Break, Check ab 61) mit Linien + Kreis, Gegner-Matchdarts/180er auf der Scheibe, Energie-Regeln (< 20 %: KI wirft, Malus wächst je Leg), Spielbericht mit Note/Star-Status/Fans, Darts News (Browser-Karte nach Titeln), ★-Preisgeld + ★-Ranglisten.
- [x] **Etappe 3 – Fähigkeit**: 4 Minispiele (Scoring, Finishing mit Linien + Kreis, Fokus-Memory mit 3 Herzen, Rechnen auf Schema-Scheibe mit Zeitlimit), 20 Level × 3 Sterne je Fähigkeit, Training 55 % Energie, Einstufung nach Profilerstellung, freies Training im Titelmenü, Formverlust mit Vorwarnung, Getränke-Shop (Bier/Schnaps/Wodka, Rausch), Darts-Shop (5 Sets mit Bonus).
- [x] **Etappe 4 – Leben**: Lifestyle-Shop (Gegenstände, Fahrzeuge, Immobilien mit Erholungsbonus), Zufriedenheit mit Wirkung auf die Wochen-Erholung, 18 Ereignis-Karten (Party, Freundin kennenlernen, Dates, Fans, Charity, Presse …), Freundin (Name, Beziehung sinkt ohne Zuwendung, Geschenk/Trennung), 26 Erfolge mit ★-Belohnung.
- [x] **Etappe 5 – Karriere-Rahmen** (Version 5): Manager (3 Stufen, Provision, Sponsor-Angebote, Beziehung), Fitnesstrainer (Wochengebühr, Erholung), Sponsoren mit Höher/Niedriger-Verhandlung, Saisonziele, Interview nach großen Ergebnissen, Wochen-Update nach jeder Woche, Saisonbericht mit Auszeichnungen. Versionsanzeige im Titelbildschirm.
- [x] **Etappe 6 – Liga** (Version 6): Liga mit PDC-/Pro-Tour-OOM in ★ und Premier-League-Tabelle, Spielplan im NSS-Look, Titelträger, Statistik, Kartenverlust → „Last Chance“ (Q-School KW 2), sonst Karriereende-Screen; alte UI-Screens entfernt.

### Annahmen Version 18
- Freier Punkt füllt den nächsten fehlenden Stern im niedrigsten nicht vollen Trainingslevel der gewählten Fähigkeit (nicht Mental).
- Note neu: 6 + (Ø − 85)/5 + (CO% − 33 %)·6 + 0,3·180er + Sieg 1/Niederlage −0,3 + 0,1·Leg-Differenz, Spanne 2–10.
- Sponsor-Prämien: Sieg = 50 % des Wochenhonorars, 180er (40 % der Angebote) = 30 %, Major-Teilnahme (30 %) = 200 % (einmal je Major). Genervter Sponsor: Zufriedenheit −8 statt +5 beim Unterschreiben.

### Annahmen Version 16
- Tourcard des Neulings bleibt 2 Saisons gültig (2026 + 2027, wie die echten Q-School-Karten 2026 laut Holder-Liste); nur die Anzeige ist jetzt eindeutig. Am Ende 2027: Top 64 → +1 Jahr, sonst Last Chance.
- Zoom-Knopf: Standard „aus“; an = immer das Viertel (200 mm) um das gewählte Ziel, auch bei Scoring-Aufnahmen.
- Balken-Animation: gilt für alle Star-Gewinne seit der letzten Anzeige (`player.starSeen`), Stufenaufstieg wächst von 0 (Beschriftung „⬆ Stufe n“).

### Annahmen Version 15
- Nationen selbst gewählt: ENG, NL, WAL, SCO, NIR, IRL, DE, BE, AT, CH, PL, CZ, HU, LV, LT, EE, SE, DK, NO, FI, FR, ES, PT, IT, HR · JP, PH, CN, HK, IN, SG, MY, TH, BH · US, CA · AU, NZ · ZA · AR.
- (Ab Version 16 abwechselndes Werfen.) Setzliste nach Teamstärke (Holder nach PDC-Rang). Gruppen: 3 Töpfe à 12, Best of 7 Legs; Gruppenplatz 2/3 = kleines Preisgeld (G2/G3).

### Annahmen Version 14
- „15 % Spielraum“ = der angegebene Average wird bei jeder neuen Karriere zufällig um bis zu ±15 % verschoben (z. B. 84 → 71–97) und bleibt dann fest; gilt für alle Pool-Spieler mit vom Nutzer genanntem Average. Alter unbekannt → zufällig 25–45.
- Jesus Salate als Argentinier (vorher MX); CDLC-Qualifier auch für BS/TT/GY/JM (Ort Nassau). Kenia und Uganda spielen den Northern-Africa-Qualifier (wie in der Nutzerliste).

### Annahmen Version 13
- Asian Tour „Platz 1, 3, 4, 5, 7“ = die 5 Besten der Tour, die nicht schon anders qualifiziert sind (Asian Championship, Japan …); ebenso PDCNB Pro Tour 2, CDC je bester US-Amerikaner/Kanadier, ADA 1, DPNZ 1.
- Wer einen Qualifier gewonnen hat, fehlt in späteren Qualifiern derselben Woche. UK & IRE Qualifier: Spieler ohne Karte + Holder außerhalb der Top 40 PDC/Pro Tour.
- Neue Pool-Spieler (u. a. Arihara, Muramatsu, Leung, Kam Weng Chen, Nitin Kumar, Sevada, Krueger, Hall, Cameron, Larsson, Pruim, Salate, Munyua) mit geschätzter Position; Coulson/Morris/Klose/Wilson sind bereits Challenge-Tour-Spieler. Ältere Spielstände bekommen fehlende Pool-Spieler nachgerüstet.
- Women's World Matchplay entfällt als WM-Qualifier (nicht in der Liste).

### Annahmen Version 12
- Doppelt Qualifizierte (z. B. Jugend-Weltmeister mit Tourcard in den Top 80) rücken nicht nach – der Platz geht an den PDPA Qualifier (dann 12–14 statt 11).
- Spieler, die über eine Tour-Rangliste schon qualifiziert sind, fehlen in den Qualifiern (Trans-Tasman, Asian Championship, Continental Cup …).

### Annahmen Version 11
- WM-Setzliste bleibt wie gehabt: 128er-Feld, Top 32 gesetzt, **alle spielen ab Runde 1** (wie bei der echten 128er-WM seit 2024/25). „Top 32 erst ab Runde 2“ passt rechnerisch nicht zu 128 Spielern (galt im alten 96er-Format).
- Platzzahlen je Affiliate-Tour und die Japan/China/Indien/CDLC-Qualifier selbst gewählt (in der Nutzerliste nicht beziffert). Die Women's World Matchplay (2 Plätze) läuft in KW 29 im Hintergrund, die Top 2 der Women's Series sind dort nicht dabei.

### Annahmen Version 10
- UK Open: Die Nutzerbeschreibung ergibt 176 Spieler (32 + 3×16 in Runde 1); umgesetzt wie real mit 160: Runde 1 = Holder ab Platz 97 + Top 8 CT-OOM + Top 8 Dev-OOM (Vorjahr, ohne Karte) + 16 Riley's-Amateure (fiktiv, UK/IRL) = 64. Gibt es mehr als 128 Holder, spielen alle, es gibt entsprechend weniger Amateure. Runde 2/3: Neueinsteiger gegen Sieger der Vorrunde (zugelost), ab Runde 4 nach jeder Runde komplett frei gelost. Plätze: Runde 1/2/3 = L160/L128/L96.
- Grand Slam: max. 16 Plätze über Sieger + Finalisten von Masters, UK Open, Matchplay, WGP, EC, Grand Slam, PC Finals, WM, PL-Finale, WS Finals (KW 46 Vorjahr bis KW 45), Rest davon nach Anzahl Pro-Tour-Titeln (PC/ET) des Jahres (Gleichstand: Pro-Tour-Preisgeld); 5 Nebentour-Plätze (Jugend-Weltmeister, Top 2 Challenge Tour ohne Karte, Top 2 Women's Series); Rest (meist 11) über den Grand Slam Tour Card Holder Qualifier (`gs-quali`, KW 45, Sektionen). Im ersten Jahr fehlen die Finalisten 2025 (keine Historie) → mehr Plätze über Titel. Töpfe: nach PDC-Rangliste, Nebentouren in Topf 4.
- Matchplay/WGP (Top 16 PDC + Top 16 Pro Tour) und European Championship (Top 32 ET-OOM) waren bereits so umgesetzt; die Pro Tour OOM zählt das laufende Kalenderjahr (nicht rollierend).

### Annahmen Version 9
- Pools aus eigenem Wissen zusammengestellt (OOM 2025, nicht verifiziert); Alter ungefähr. Ø = Basis je Tour (Women 84, Asien 89, CDC 88, Nordic & Baltic 88, DPA 87, Osteuropa 87, DPNZ 86) − 1 je Platz.
- Nebentour-Spieler entwickeln sich nicht und gehen nicht in Ruhestand (Pool bleibt bei 8); Jahres-OOM = Ø + Zufall (σ 2,5), fest je Jahr (`secondaryOrder`).
- Masters-Vorrunde: je der Beste der Vorjahres-OOM aus 6 Nebentouren (ohne Osteuropa); JDC = 4 beste Dev-Spieler ≤ 18. Grand Slam: die letzten 2 der 4 Pro-Tour-Nachrücker-Plätze gehen an die Top 2 der Women's Series.

### Annahmen Version 8
- Vorrunde liegt in KW 4 (Woche vor dem Hauptturnier) statt „am Vortag“ – der Kalender kennt nur Wochen, und das Hauptfeld braucht die Qualifikanten vorher.
- 32 Gruppensieger + 32 Gesetzte = Letzte 64; damit genau 8 übrig bleiben, werden Letzte 64, 32 und 16 gespielt (3 K.-o.-Runden).
- Nebentouren ohne eigene Simulation (ab Version 9 mit eigenen Spielerpools).

### Annahmen Version 7
- Holder-Liste: Spieler 65–99 der Nutzerliste haben 2026 ihr letztes Kartenjahr (wie Top 64: Verlust außerhalb der Top 64), 100–128 (Q-School 2026) Karte bis 2027. Nationen laut Liste übernommen (u. a. Dolan IRL, Dekker NO, Lukasiak SE, Ljubić HR). Alter = Listenwert − 1.
- Masters: alle Holder spielen (Feld 128, Spieler ggf. statt des 128.), Top 24 nach Rangliste vorn – keine eigene Vorrunden-Veranstaltung.
- Schwierigkeit: Neuling ≈ schwächster Holder (Sim ~25–35 % Siege gegen das PC-Feld), Schlüsselmomente machen den Unterschied.
- Zoom nur bei Rest ≤ 170. Scoring-Schlüsselmoment höchstens 1× je Leg.
- Meilenstein-Screenshot des Nutzers fehlte – Gestaltung als Kachel-Raster (grau/farbig) nach Beschreibung.

### Annahmen Etappe 6
- „Last Chance“ = die normale Q-School (UK oder Europa) in KW 2 des Folgejahres: Halbfinale an einem der 4 Tage → Tourcard bis Ende Folgejahr. Wer nicht spielt oder scheitert, beendet die Karriere (Spielstand bleibt als „Karriereende“ im Slot).
- Titelträger zeigt nur Tour-Turniere (keine Challenge/Dev/Qualifier). Statistik ohne alte €-/XP-Werte.
- Alte Logikmodule (home, slump, staff, sponsors alt …) bleiben im Code, weil Tests und Nicht-NSD-Zweige sie nutzen; im Tour-Modus ruhen sie.

### Annahmen Etappe 5
- Star-Status-Zahlen unverändert (Sieg ≈ 12 Punkte, Balken +3 %/Stufe); neue Quellen: Interview (bis 27), Saisonziele (10 je Ziel), Auszeichnungen (30), Titel (25 × Gewicht).
- Sponsor-Geld wird wöchentlich gezahlt (statt Jahresgehalt/Antrittsgeld/Bonus des alten Systems); Vertrag 12–52 Wochen, Betrag beim Unterschreiben fest.
- Manager-Beziehung sinkt zufällig (15 %/Woche −1) – Erfolge, Ziele und gute Interviews halten sie oben.
- Interview-Antworten wirken unabhängig von der Frage (Stil zählt); großspurig gelingt nach Titeln zu 55 %, sonst 35 %.
- Auszeichnungen nach Saison-Preisgeld (PDC/Pro Tour des Jahres); Newcomer = Karte über Q-School/CT/Dev des Vorjahres. Version wird bei jeder Etappe erhöht (`APP_VERSION`).

### Annahmen Etappe 4
- Zufriedenheit wirkt über die Erholung (−10 … +10 % Energie/Woche), nicht direkt auf die Match-Leistung. Startwert 60, ein Neuling ohne Lifestyle pendelt sich bei ~40 ein.
- Immobilien: keine Miete mehr (alter Wohnen-&-Auto-Screen ruht im Tour-Modus); es zählt nur die beste Immobilie für die Erholung.
- Ereignisse: 35 % pro Woche, höchstens eins offen; Kosten-Optionen sind ohne genug ★ gesperrt. Manager-/Sponsor-Effekte greifen erst, wenn diese Beziehungen existieren (Etappe 5).
- Alte Meilensteine (XP) sind im Tour-Modus durch Erfolge mit ★-Belohnung ersetzt.

### Annahmen Etappe 3
- Schnaps/Wodka-„Fähigkeit“ = vorübergehender Rausch (+2/+3 auf alle trainierbaren Fähigkeiten) bis Wochenende, nicht dauerhaft – sonst ersetzt Trinken das Training.
- Wodka-Beziehung +1 geht an die niedrigste bestehende Beziehung (Fans immer, Manager/Freundin/Sponsoren nur wenn > 0).
- Energie: Bier +20, Schnaps +25, Wodka +30 %. Training nur ab 55 % Energie.
- Darts-Sets: Messing 10 ★ (Scoring +1) … Signature 350 ★ (+6/+4/+3/+1); Bonus zählt im Match, nicht in den Minispielen-Werten (nur Kreisgröße).
- Formverlust: ab Woche 9 je Woche 35 % Chance (nicht garantiert); Vorwarnung einmalig in Woche 7.
- Fokus-Memory: Sterne = verbleibende Herzen (3 Herzen = 3 Sterne). Rechnen: neue Zahl je Versuch. Einstufung mit Kreis wie Fähigkeit 0.
- Rechnen nutzt eine Schema-Scheibe mit gleich breiten Ringen (echte Doppel-/Triple-Ringe sind am Handy kaum antippbar).

### Annahmen Etappe 2
- Umrechnung geändert: Fähigkeit 0 → Attribut **85** (statt 82; mit 82 gewann ein Neuling praktisch kein Match), +0,25 je Punkt → 60 = 100. Bot-Saison mit Fähigkeiten 0: ~7 Siege in 24 PC-Matches.
- Keine Reisekosten im Tour-Modus (sonst Sackgasse ohne ★); ★ gehen später an Getränke/Shops.
- Ranglisten speichern Basis-★ (alle Spieler bekommen die ★-Tabellen); vorbelegte €-Werte 2025/26 ÷ 1.000. Anzeige × eigener Status-Faktor.
- Youth-WM 10 ★, CT/Dev 5 ★ (nur KI), WS-Finals 50 ★, World Cup 120 ★ je Team (dein Anteil 50 % = 60 ★).
- Lampenfieber im Tour-Modus aus (Start ist schon nominell der Schwächste). Erfahrung/Selbstvertrauen laufen still weiter.
- Star-Status-Zahlen (12 je Sieg, Balken +3 %/Stufe) sind vorläufig – Feinabstimmung in Etappe 5.
- Schlüsselmomente: im Entscheidungsleg wirfst du jede eigene Aufnahme selbst; „Sofort beenden“ simuliert ohne Schlüsselmomente.

### Annahmen Etappe 1
- Fähigkeit 0 → Attribut 82 (in Etappe 2 auf 85 angehoben), 60 → 100. Startwerte bis zur Einstufung (Etappe 3): 0, Mental 1.
- Startguthaben 25 ★, Energie 100 %, Fans 10, Zufriedenheit 60. Euro-Finanzen laufen intern weiter, bis Etappe 2 auf ★ umstellt; Liga zeigt vorerst € an.
- Google Fonts (Jost, Anton) mit System-Fallbacks. Alte Spielstände (Schlüssel `dartsCareer.slot.N`) bleiben im Browser liegen, werden aber nicht angezeigt.

## Bisherige Phasen (Darts Career)

## Phasen
- [x] **Phase 1 – Gerüst & Hub** (Dateistruktur, Designsystem, Charaktererstellung, State/Speichern, Wochenkalender, Hub, Finanzen, Platzhalter-Spielerdaten, lokale Turniere per Simulation)
- [x] **Phase 2 – Match-Engine** (manuelles Spiel mit Scheibe/Zielkreuz, Scoreboard, Gegner-KI, „Rest simulieren“, Balancing)
- [x] **Phase 3 – Unterbau-Tour** (echte Spielerdaten, Q-School, Challenge/Dev Tour + OOM, Altersregel, Tourcards, Jahreswechsel/KI-Entwicklung)
- [ ] Phase 4 – Pro Tour (Tourcard 2 Jahre/Top 64, Players Championships, European Tour, Rankings, Preisgeld)
- [x] **Phase 5 – Majors & Events** (WM, UK Open, Masters, Matchplay, Grand Prix, Grand Slam, PC Finals, World Cup, Premier League, World Series)
- [x] **Phase 6 – Sponsoren & Politur** (Sponsoren, Statistik-Archive, Animationen, Balancing, README final)

## Stand Phase 1
- Spielbar: Neue Karriere → Hub → Woche → lokales Turnier melden → Runde für Runde simulieren (FUT-Karten-Vorschau, Ergebnis-Modal mit Stats) → Bracket → Preisgeld/XP → „Weiter“.
- Kalender zeigt das komplette Jahr (alle Kategorien); nicht implementierte Events sind ausgegraut mit Grund („Ab Phase X“, „Tourcard nötig“ …) und Kostenanzeige.
- Speicher: 3 Slots, Auto-Save nach jeder Woche/Runde, Export/Import JSON, Fortsetzen im Menü.
- Profil: Attributpunkte verteilen, XP-Balken. Statistiken, Finanzen, Neuigkeiten, Ranglisten (vorläufig nach Stärke), Karriereende mit Bilanz.
- Tests: `node tests/run.mjs` (Logik), `node tests/calib.mjs` (Engine-Kalibrierung), `node tests/season.mjs [seed]` (3-Jahres-Balancing nur lokal).

## Stand Phase 2
- Im Turnier pro Match wählbar: **Simulieren** (schnell, aufnahmebasiert) oder **🎯 Selbst spielen**.
- Manuelles Spiel: SVG-Scheibe mit Zielkreuz + markiertem Zielfeld, Ziel per Tippen oder Chips (Checkout-Weg wird vorgeschlagen), zwei Linien nacheinander stoppen (Tippen/Button/Leertaste), Pfeil-Markierungen, Bust-/Leg-/Satz-Banner, „Nerven!“-Hinweis bei Druck.
- Linien per requestAnimationFrame, Position aus Absolutzeit (gemessen: konstant 16,7 ms/Frame, keine Ruckler).
- Scoreboard: Rest, Legs (Sätze), Live-Average, letzte Aufnahme, aktiver Spieler, „Entscheidung“-Hinweis.
- **Schnellsimulation** (Wunsch Nutzer, DartConnect-Optik): alle Aufnahmen sichtbar, 1 Aufnahme = 1,5 s, rot Leg-Average / weiß Gesamt-Average beim Namen; Pause, „Selbst spielen“ (Wechsel mitten im Match), „Sofort beenden“. Im Turnier jetzt 3 Optionen: Selbst spielen · Schnellsimulation · Sofort.
- Gegner wirft automatisch dartgenau. „Rest simulieren“ jederzeit. Zurück/Neuladen → „Match fortsetzen“.
- Checkout-Wege 2–170 berechnet (z. B. 170 T20 T20 Bull, 81 T19 D12, 41 9 D16), Bogey-Zahlen ohne Weg.
- Kalibrierung KI-Darts: Ziel-Ø 45/62/80/100/106 → gemessen 44/63/80/100/106.
- Manuell (Mensch mit ±50 ms Reaktion): Attribute 42 → Ø ~56, 70 → ~83, 95 → ~114; mit ±75 ms deutlich schwächer.

## Stand Phase 3
- Echte Namen: 128 Tourcard-Holder 2026, 92 Challenge- (62 Nutzerliste CT-OOM + 30 fiktive Europäer) und 98 Dev-Spieler (Nutzerliste Dev-OOM), 50 fiktive Amateure.
- Q-School (UK/EU, 4 Tage, 4 Karten/Tag/Standort), Challenge Tour + Development Tour (je 24 Turniere, Doppel-Wochenenden), Youth-WM – selbst spielbar (alle 3 Match-Modi) oder im Hintergrund simuliert.
- Ranglisten CT-OOM / Dev-OOM mit Tourcard-Linie, Rang im Hub. News: Q-School-Karten, OOM-Stand nach jedem Wochenende, Saisonbilanz.
- Jahreswechsel: Tourcards für CT/Dev Top 2, Kartenverlust außerhalb Top 64, Dev-Altersgrenze 23, KI-Entwicklung, Ruhestand, generierte Talente.
- Große Felder: Setzliste + Freilose; Turnierbaum ab den letzten 32, „Dein Weg“ mit allen eigenen Matches.
- Balancing (tests/career.mjs, einfacher Bot): Tourcard nach ~4–5 Saisons (Alter 21–23, Ziel-Ø ~90).
- 15 Node-Tests; 3 KI-Saisons in ~0,2 s, Spielstand ~70 KB.

## Umbau nach Phase 4 (Nutzerwunsch, vor Phase 5)
- „Selbst spielen“ ausgeblendet; im Turnier: 📺 DartConnect (mit Störmomenten) oder ⚡ Schnellsimulation.
- Neue Attribute Scoring/Finishing/Mental/Fokus als Perzentile (Start 60 = ~65 Ø) + Erfahrung −4…+10 (Clutch).
- Lokale Turniere: 16 Spieler, nur im eigenen Bundesland. 4 DDV-Ranglistenturniere/Jahr (64 Spieler, mehr XP).
- Training-Panel direkt nach jedem Turnier; Teilnahme-XP sorgt dafür, dass man sich anfangs nach fast jedem Turnier verbessert.
- Störmomente mit 2 Entscheidungen und sichtbarer Erfolgschance (7 Situationen, je nach Turnierebene).
- Balancing (tests/career.mjs, Bot verteilt Punkte gleichmäßig): Tourcard nach ~5–6 Saisons, nach 8 Saisons PDC-Platz ~20–40, Erfahrung +9.
- Spielstand-Migration v5: alte Attribute → Perzentile, Welt v3 (Erfahrung, DDV-Pool), Bundesland-Standard NRW.

## Stand Phase 4
- Players Championships (30 Turniere, Doppel-Blöcke) und European Tour (14 Events mit Qualifikation → 48er-Hauptfeld, Top 16 gesetzt) spielbar in allen Match-Modi und im Hintergrund simuliert.
- PDC OOM (2 Jahre, mit Startwerten 2025/2026) und Pro Tour OOM werden mit Preisgeld gefüllt; Top 64 am Jahresende nach Geld. Rang im Hub und in den News nach jedem Pro-Tour-Wochenende.
- News: Pro-Tour-Sieger der Woche, eigene Quali-Ergebnisse.
- Check Saison 2027: Pro-Tour-Spitze Littler (~0,5 Mio. €), van Veen, Rock, MvG …; Grenze Platz 64 ≈ 100 Tsd. €; ~28 Kartenverluste.
- Balancing (tests/career.mjs): Bot holt Tourcard nach 4–6 Saisons und hält sich danach auf PDC-Platz ~30–60.
- 17 Node-Tests; 3 Saisons inkl. Pro Tour ~0,6 s, Spielstand ~85 KB.

## Stand Phase 5
- Alle Majors, World Series, World Cup und Premier League spielbar (DartConnect/Schnellsimulation) und im Hintergrund simuliert; Qualifikation aus PDC-/Pro-Tour-/ET-/CT-/Dev-/WS-Wertungen, Eignung im Wochen-Screen mit Grund („Top 24 der PDC OOM (du: Platz 87)“).
- Grand Slam mit Gruppenphase + Tabellen, World Cup mit Zweierteams, Premier League als Zusatz-Event mit Tabelle (Ranglisten → Tab „Premier League“), WM mit 128 Spielern in Sätzen inkl. WM-Quali.
- Check Saison 2027 (Hintergrund): Littler gewinnt WM, Masters, UK Open, Matchplay, EC, PL; van Veen WGP/PCF; Feldgrößen stimmen (24/160/32/32/32/32/64/48/128); ganze Saison ~0,35 s.
- Ruheständler bleiben als 'retired' erhalten (Namen in alten Tabellen).
- 22 Node-Tests.

## Stand Phase 6
- Sponsorensystem komplett (Screen mit 4 Vertragsplätzen, Angeboten, Kündigung; Zahlungen in den Finanzen; Hub-Badge für neue Angebote).
- Statistik-Archiv: Saison-Archiv (Status, Rang, OVR, Erfahrung, Ø, Titel, Preisgeld), Titelliste, Bestergebnisse je Event/Serie, Höchstplatzierungen.
- Karriereende-Bilanz um Major-Titel, beste PDC-Platzierung, Sponsoreinnahmen, Erfahrung und Titelliste erweitert.
- Animationen: Konfetti + Gold-Panel bei Titel/Tourcard; Toasts stapeln sich nicht mehr.
- Balancing: KI-Attribute mit Nachkommastelle, mehr Tagesform-Streuung, Littler 102,5 Ø → Titel verteilen sich (Littler 2–6 pro Saison statt fast alle).
- Bugfixes: Gruppen-Aus-Platzierung, Ruheständler bleiben erhalten, Bestplatzierung ignoriert Quali-Ergebnisse, automatische PL-Spieltage erscheinen in der Historie.
- README final (Hinweis „nur private Nutzung, echte Namen“). 23 Node-Tests.

## Erweiterung nach Phase 6 (Nutzerwunsch)
- Neues Attribut **Rechnen**: niedrige Werte → öfter Bogey-Reste, falsche Doppel/Wege, Busts; in beiden Simulationen und für KI. Bogey-Reste als Statistik und ⚠ im DartConnect-Scoreboard.
- **Wöchentliches Training** (Hub-Kachel, eigener Screen): 1 Einheit/Woche, Fortschrittsbalken je Attribut; ohne regelmäßiges Training Formverlust (Warnung ab 2 Wochen Pause).
- Migration v6 (Rechnen: Spieler 60, KI ≈ Scoring). 25 Node-Tests.

- Charaktererstellung: 25 Bonuspunkte frei auf die 5 Attribute verteilen (+/−, „Gleichmäßig“, „Zurücksetzen“, Live-Karte).

- **Checkout-Entscheidungen** im DartConnect: gelegentlich Wegwahl bei 41–170 Rest mit geschätzten Chancen (Genauigkeit/Empfehlung über Rechnen).
- **Wochenplan** statt reinem Training: Training, Ruhetag, Sponsortermin oder Exhibition – nur eins pro Woche. Neue **Ermüdung** durch Turniere (Leistungsabzug ab 30 %). **„⏭ Nächstes Event“** springt über leere Wochen (mit Auto-Training). 27 Node-Tests.
- **Echte Spielerlisten** (Tourcard-Holder inkl. Herkunft, Dev Tour, Challenge Tour) vom Nutzer übernommen; Kartenregel Top 64 → +1 Jahr; Holder ≤ 23 außerhalb Top 64 spielen Dev Tour.
- **Tour-Seite** (🎫 im Hub): Tourcard-Holder mit „Karte bis“ + Herkunft (Filter: läuft aus, Top 64, Q-School, CT/Dev) und Titelträger (aktueller Sieger je Major/WS/PL/Youth-WM + Siegerliste aller Turniere je Saison). Startalter 16.
- **Level-System** (Nutzerwunsch): Level 1–100, 50 XP für Level 2, 100 für Level 3 …, Kurve wird zum Ende steiler (bis 14.650 XP je Level); je Level 5 Attributpunkte. Profil zeigt Level + Fortschritt, Turnierende XP-Balken, News „⬆️ Level N“. Migration v7: Level aus Gesamt-XP, schon verdiente Punkte bleiben. Bot: Level 17 nach Saison 1, ~51 nach 8 Saisons.
- Fix: Dev-Pool lief nach ~7 Saisons leer (Absturz in Dev-Turnieren), weil der große Pool ohne Karte keine Talente mehr bekam → jährlicher Nachwuchs + Obergrenze 200.
- Lokale Gegner schwächer (Nutzerwunsch): −6 Ø (jetzt 54–74 statt 60–80). Frischer Spieler ohne Training: Turniersiege lokal ~3 % → ~18 %, Aus in Runde 1 50 % → 36 %. Migration v8 für bestehende Spielstände.
- **Training aufgewertet** (Empfehlung umgesetzt): jede Einheit gibt XP (3 % des Level-Bedarfs, wächst mit) + Turniervorbereitung +3 auf das trainierte Attribut für diese und nächste Woche; Formverlust milder (ab 4 Wochen, 10–30 %). Exhibition-XP skaliert ebenfalls (5 %). Bot: Training ≈ +25–30 % XP (2030: 52k statt 40k), Level 64 statt 54 nach 8 Saisons.
- **Großes Paket (Nutzerwunsch)**: Team-Screen mit Manager (3 Stufen, Provision 10–20 %, mehr/bessere Sponsoren, Exhibition-Einladungen als Klick-Event) und Trainer (Einmalzahlung, 1 Jahr, +10–30 % XP); Erfahrung zählt auf der großen Bühne (Majors, gegen Top 16); Selbstvertrauen/Momentum mit Anzeige; Gegner-Matchdarts Wurf für Wurf auf der Dartscheibe; Interviews nach Majors (Floskel-Memory). 34 Node-Tests.
- Lokale Turniere nur noch deutsche Spieler (20 Namen ersetzt, Migration v9). Turnier-XP gesenkt (lokaler Sieg ~120 statt ~260 XP, frühes Aus ~30 statt ~70). **Level-Up-Fenster** (großes „LEVEL UP! N“, +Punkte, „Punkte verteilen“) und **animierter Level-Balken** im Hub und am Turnierende (füllt sich, läuft bei Aufstieg über).
- Erholung kaufen (Nutzerwunsch): Saunabesuch (−10 % Ermüdung) und Massage (−15 %) im Wochenplan, je 50–100 €, je 1× pro Woche, zusätzlich zur Wochenaktivität.
- Checkout-Entscheidung zeigt nur noch die Wege, keine Wahrscheinlichkeiten mehr („★ Empfohlen“ ab Rechnen 75 bleibt).
- **WDF-Opens** (Nutzerliste): 20 Turniere für Spieler ohne Tourcard, Sieg 1.000–2.500 € je nach Kategorie, Finale 500/HF 250/VF 100 €, Reise Europa 400 €/Übersee 1.000 €.
- WDF: zufälliger XP-Boost ×1,2–1,6 je Turnier (Anzeige am Turnierende); pro Woche nur noch ein WDF-Open (Tallinn, Canadian und Philippines Open gestrichen → 17 Events).
- **Rivale** (Vorschlag 2): gleichaltriges Talent, Duelle mit Bilanz, News, Selbstvertrauen, eigener Screen + Hub-Kachel, Banner im DartConnect, hält mit deinem Niveau mit (Migration v10). Bot-Karriere: ~50–80 Duelle in 8 Saisons, Bilanz ausgeglichen.
- Fix: XP-Anzeige am Turnierende/nach Matches enthält jetzt den Trainer-Bonus.
- Challenge/Dev Tour: immer 5 Turniere pro Wochenende (Nutzerwunsch), 5 Wochenenden je Tour = 25 Turniere (vorher 12 × 2).
- Hub: Button „✓ Alle gelesen“ in der Neuigkeiten-Kachel (setzt alle Meldungen auf gelesen, ohne den Feed zu öffnen).
- Checkout-Entscheidung (Nutzerwunsch): immer 3 Wege mit festem Ausgang – einer checkt, einer spielt sauber auf ein Doppel runter, einer wird eine sehr schlechte Aufnahme. Für 115 von 130 Resten (41–170) gibt es 3 Wege; sonst keine Entscheidung.
- Preisgelder CT/Dev (Sieg 3.000 … L64 100 €) und DDV (Sieg 350, Finale 100 €) nach Vorgabe; lokale Turniere immer best of 5; Dev Tour 4 Ø schwächer als CT; 90 schwache fiktive Spieler im CT/Dev-Pool (Migration v11).
- Turnieranzahl bei CT/Dev wählbar (1–5, je 25 €); **Host-Nation-Qualifier** für ET-Events im eigenen Land (bis zu 4 Turniere, Sieg = ET-Hauptfeld).
- WM-Qualifier für Q-School-Teilnehmer (KW 46, Sieger spielt die WM).
- Zufallsereignisse (Finger eingequetscht, Schule bis 18, Zahn-/Rückenschmerzen, Erkältung, Magen-Darm): Trainingsrückschlag oder seltener eine Woche ohne Turnier.
- Exhibitions nur noch auf Angebot (ab Tourcard), Gage steigt mit dem Level.
- **Meilensteine** mit Extra-XP (16 Stück, Liste im Profil). Alte Spielstände bekommen sie ab jetzt (keine rückwirkende Vergabe).
- Formverlust neu (Nutzerwunsch): jedes Attribut muss mindestens alle 6 Wochen trainiert werden, sonst Rückgang bei diesem Attribut; Anzeige „zuletzt vor X Wo.“ je Attribut. Alte Spielstände starten mit höchstens 4 Wochen (Schonfrist).
- Preisniveau steigt mit dem Level (+1 % je Level) für Reise, Sauna/Massage (Startgebühren fix 25 €, PC/ET/Majors ohne Gebühr). Lampenfieber in den ersten 60 Profi-Matches. Mehr Schaltungen ans Board (Matchdarts beider Seiten, große Checks, 180er). Wohnen & Auto: Auszug mit 18 (5 Wohnungen, Jahresmiete, Erholung/Selbstvertrauen), Auto-Shop (3 Autos, Reiserabatt, Wartung). European-Tour-Qualifikation nach PDC-Modell (Top 16 PDC, Top 16 Pro Tour, 10 TCHQ nach dem PC-Block, 4 HNQ, Nordic & Baltic, Osteuropa). WM-Qualifikation nach PDC 2027: Top 40 PDC + 40 Pro Tour, Jugend, CT/Dev Top 3, 17 internationale Qualifier (35 Plätze), TCHQ mit Restplätzen. Formtiefs (5 Auslöser-Typen) und einmalige Kosten bei hohem Vermögen. Startalter 16–30 wählbar, Attributpunkte je Level steigend 1 → 7. Fiktive Spieler mit zufälligen, länderpassenden Namen je Karriere. Dev Tour ohne Q-School (bis 23). Bot-Karriere trainiert jetzt wie ein echter Spieler reihum (`mostOverdue`): Tourcard nach 6 Saisons, Level ~50 nach 8.

## Mögliche nächste Schritte
- Manuellen Modus auf Perzentil-Attribute kalibrieren und wieder freischalten.
- Echte Spielerdaten prüfen/ergänzen (siehe „Unsichere Angaben“).
- Mehr Störmoment-Situationen, Interviews/Pressekonferenzen, Rivalitäten.

## Annahmen
- Preisniveau +1 % je Level (Level 50 ≈ +49 %); Preisgelder, Trainer-/Managerkosten bleiben unverändert.
- Zufallsereignisse: 7 % pro Woche (≈ 3–4 im Jahr), davon 25 % Ausfall (≈ 1 Woche/Jahr ohne Turnier). Rückschlag trifft nur den Trainingsfortschritt, keine Attributpunkte.
- WM-Qualifier Q-School: KW 46 („Mitte November“), Milton Keynes, kein Preisgeld, XP-Faktor 1,3; ein WM-Platz für den Sieger.
- HNQ: Woche vor dem ET-Event; „bis zu 4 je Wochenende“ = bis zu 4 Qualifier-Turniere, jedes Turniersieg qualifiziert (danach endet der Block, Gebühren für nicht gespielte werden erstattet). Kein Preisgeld. Bei Auswahl spielt man immer die ersten n Turniere des Blocks.
- Checkout-Entscheidung: Welcher Weg checkt, bestimmt die eigene Trefferchance (bester Weg = Check). Ausgang ist bewusst fest (kein Zufall), damit die Wahl zählt; Rechnen ≥ 75 verrät per ★ den Check-Weg.
- CT/Dev: 5 Wochenenden je Tour (Gesamtzahl wie real ~24–25 Turniere); Termine KW 11/19/29/37/42 (CT) und 14/22/32/39/43 (Dev), möglichst ohne DDV-Überschneidung.
- Rivale: gleiche Nation, Stärke folgt dir (50 %/Jahr), damit die Rivalität spannend bleibt; Häufigkeit über gezielte Feldplätze lokal/DDV/WDF (sonst nur Zufall in CT/Dev/Q-School/Tour).
- WDF: KW nach den Terminen 2026 (gilt jedes Jahr gleich). Orte für Dänemark/England/Finnland/Kanada/NZ/Australien/Wales/Tschechien/Italien geschätzt; Italian/Finnish Open (ohne Kategorie) als Bronze. Bei zwei WDF-Opens in einer KW bleibt nur eins: Estonian Open, The Steel Masters, Belgium Open (Nutzerwunsch statt Philippines). Keine Startgebühr. Feld = zufällige Spieler ohne Karte + DDV-Pool (keine echten Übersee-Amateure).
- XP gesenkt: Basis Match 10/Sieg 15/Runde 6/Titel 40/Teilnahme 45, lokal ×0,55. Bot (spielt aus Geldmangel fast nur lokal) erreicht nach 8 Saisons Level ~47 / OVR ~92, noch ohne Tourcard – wer CT/DDV spielt, steigt schneller. Level-Up-Fenster im laufenden Turnier erst nach Turnierende.
- Manager-Provision 10/15/20 % (übliche Spanne im Sport); Freischaltung nach Tourcard/Top 64/Top 16. Exhibition-Einladungen kommen zusätzlich zum Wochenplan (Ermüdung +15). Trainerpreise 1.500/6.000/18.000 €.
- Bühnen-Effekt symmetrisch um Erfahrung +3 (typischer Tour-Profi): Neuling (−4) auf großer Bühne ≈ −5 Punkte, Veteran (+10) ≈ +5. Momentum lokal nur ¼, damit Kneipenturniere keinen Dauer-Lauf erzeugen (Bot: meist „Normal“, Phasen mit Selbstvertrauen).
- Matchdart-Scheibe erscheint für die ganze Aufnahme, sobald der Gegner auf einem Match-Finish steht (auch wenn zuerst gestellt wird).
- Level-Kurve: 50·L·(1 + 2·((L−1)/99)²) XP – erfüllt 50/100 aus dem Wunsch, ab Mitte deutlich steiler. Frühe Saisons etwas schneller als das alte Punktesystem (Saison 1 ≈ 80 statt 55 Punkte), ab Saison 4 gleich, danach langsamer.
- Beobachtung: Bot (spielt aus Geldmangel viel lokal) bekommt mit der stärkeren echten CT/Dev-Welt erst nach 8+ Saisons eine Karte – Balancing ggf. nachziehen.
- Startalter 16 (Nutzerwunsch). Titelträger werden ab Karrierestart 2027 erfasst (2026er Sieger nicht hinterlegt). Herkunft 2026: Bellmont/Labanauskas = CT 2025, Greaves/Bates = Dev 2025 (Zuordnung geschätzt). Alte Spielstände: Herkunft „–“, bis neue Karten vergeben werden.
- **Wochenplan**: Exhibition/Sponsortermin-Beträge und Ermüdungswerte sind Balancing-Werte (js/training.js). Auto-Training beim Sprung, damit Überspringen keinen Formverlust erzeugt.
- **Rechnen/Training**: Formverlust widerspricht bewusst der ursprünglichen Regel „nie schlechter“ (Nutzerwunsch); Alterungsverlust gibt es weiterhin nicht. KI trainiert implizit (Entwicklung nach Alter), hat keinen Formverlust.
- **Phase 6**: Sponsorennamen fiktiv. Jahresgehalt-Raten auch für das laufende Jahr ab Unterschrift (Antrittsrate = 1 Quartal). Premier-League-Spieltagssiege zählen nicht als Titel (nur Bestergebnis).
- **Phase 5**: Qualifikationsregeln vereinfacht (siehe CLAUDE.md). World Grand Prix ohne Double-In. WM komplett im alten Jahr (KW 51–52), Preisgeld zählt fürs laufende Jahr. Premier-League-Spieltage brauchen keine Woche, kosten aber Reise; Bonus 12.000 € pro Tagessieg, Play-offs 300.000 € Sieg. PL-, WS- und World-Cup-Geld zählt nicht zur PDC OOM. WS-Qualifikanten = zugeloste Tour-Spieler (PDC 9–64). „International“-WM-Plätze = stärkste Spieler ohne Karte (inkl. DDV-Pool).
- **Umbau**: Perzentil→Average-Kurve geschätzt (60 ≈ 65 Ø). Erfahrungsstufen-Schwellen, XP-Werte und Störmoment-Chancen/Effekte sind Balancing-Werte (data/distractions.js, js/player.js) – leicht anpassbar.
- DDV-Turniere gibt es unabhängig von der Nation (auch für Nicht-Deutsche), Reise immer Deutschland-Tarif. Für Nicht-DE-Spieler gibt es kein Bundesland; lokale Turniere nutzen dann die Städteliste der Nation.
- Störmomente nur, wenn der Spieler wirft, max. 1 pro Match; nicht in der Schnellsimulation.
- **Phase 4**: PC-Auslosung frei (ohne Setzliste); bei mehr als 128 Holdern spielen die 128 bestplatzierten der PDC OOM. ET ohne Host-Nation-/Associate-Qualifier: alle 32 Quali-Plätze gehen an Tour-Holder. Keine Teilnahmegebühren auf der Pro Tour, nur Reisekosten (ET-Quali + Hauptfeld = eine Reise).
- PDC-OOM-Startwerte 2025/2026 sind synthetisch (Kurve nach Listenplatz), nicht die echten Beträge.
- **Phase 3**: Q-School ohne Setzliste, nur Spieler ohne Karte (Pools ~60–75 je Standort, real ~400). Gebühr 4 × 25 € wird bei Meldung komplett fällig, auch bei Kartengewinn an Tag 1.
- Challenge/Dev-Turniere: first to 5, Finale first to 6; Preisgeld CT 3.500 € Sieg … 175 € Letzte 32, Dev 2.800 € … 150 €, Youth-WM 12.000 € (zählt nicht zur OOM).
- Bis Phase 4 hat die PDC OOM kein Preisgeld → „Top 64“ am Jahresende = 64 stärkste Tour-Spieler. Folge: der eigene Spieler verliert eine auslaufende Karte, wenn er nicht zu den 64 stärksten gehört.
- Tourgröße schwankt (Q-School vergibt fest 32 Karten): ca. 125–140 Holder.
- XP großzügiger als in Phase 1 (Schwelle 50 + 3·n), damit eine Tourcard in einigen Saisons erreichbar ist.
- Kalender nutzt ISO-KW 1–52, KW 53 wird übersprungen. WM in KW 51–52 (Finale Anfang Januar nicht separat).
- Kalender 2027 frei nach PDC-Muster (Termine/Orte angenähert): PC 15 Doppel-Blöcke, ET 14 Events, CT/Dev je 5 Wochenenden à 5 Turniere, Q-School UK (Milton Keynes) + EU (Kalkar) beide KW 2.
- Mehrfach-Events (PC-Doppel, CT/Dev-Wochenende mit 5 Turnieren) zählen als *ein* Wochen-Event; Anmeldegebühr 25 € **je Turnier** (CT-Wochenende = 125 €, Q-School 4 Tage = 100 €).
- Reisekosten richten sich nach dem Land des Events (UK-Landesteile = England-Tarif), unabhängig vom Heimatland.
- Lokale Turniere: jede Woche außer KW 52; Ort aus Städteliste der eigenen Nation; 32er-Feld; Ft3 bis VF, HF Ft4, Finale Ft5; Preisgeld Sieger 50–200 € (10er-Schritte), Finale 40 %, Halbfinale 20 %. Keine Reisekosten.
- Gegner im lokalen Turnier: zufällige 31 aus den 50 fiktiven Amateuren (unabhängig von der eigenen Nation).
- XP: Match 10, Sieg +16, +6 je Runde, Titel +50, × Kategoriefaktor (lokal 0,8 … Major 2). Punktschwelle 60 + 8·(verdiente Punkte). Attributkosten 1/2/3 Punkte (<60 / 60–79 / ≥80).
- Kein vorgegebener Start-Average (Wunsch Nutzer): Karte/Hub/Profil zeigen den gespielten Karriere-Average (`player.avgReal`). Gegner zeigen ihren Daten-Average.
- Attribut→Engine-Leistung intern: 30 + 0,77·Scoring; Checkout-Basis = 12 % + 0,33 %·Doppelquote.
- Manuelles Spiel: y-Linie läuft 13 % schneller als x-Linie; Startphase zufällig (kein Auswendiglernen). Ziel-Tippen rastet auf die Feldmitte ein (Single → äußeres Single-Feld).
- KI im Hintergrund nutzt weiter die schnelle Aufnahme-Simulation; Live-Gegner nutzen das dartgenaue Modell. Checkout-% liegt dartgenau etwas niedriger (realistischer) als in der Schnellsimulation.
- Checkout-% zählt jeden Dart mit Rest ≤ 40 (gerade) bzw. 50 als Doppelversuch.
- Wohnen: Effekte als Ermüdung −X/Woche und Selbstvertrauen +X/Woche (Villa +6/+0,6); Wohnheim zusätzlich −1 auf alle Attribute. Ohne Wahl nach 2 Wochen → Wohnheim. Alte Spielstände (≥ 18): Auszugsmeldung in den nächsten Wochen. Auto-Rabatt gilt für alle Reisen (auch Flüge). Kontostand darf durch Pflichtzahlungen (Miete/Wartung) ins Minus fallen.
- Lampenfieber −5 (Fokus −3) abgebaut über 60 Profi-Matches (PC/ET/Majors/WS/PL), zählt auch ohne Karte (UK Open).
- ET-Qualifikation: TCHQ in der Woche des letzten PC-Blocks vor dem ET-Event (KW 23 → TCHQ KW 21). 10 Sektionen ohne Setzliste. Nordic & Baltic (DK/SE/NO/FI/EE/LV/LT) und Osteuropa (PL/CZ/HU/HR/SI) nur im Hintergrund, gewichtete Auswahl der 8 Stärksten ohne Karte. Zu wenige Spieler für HNQ/Regional-Qualifier (z. B. Schweiz) → fiktive Amateure (Ø 58–72) werden einmalig angelegt.
- WM: Die Nutzerliste nennt „8“ Europa-/„12“ Asien-Plätze, die Einzelposten ergeben 10 bzw. 14 – umgesetzt sind die Einzelposten. Der WM-Qualifier der Q-School-Teilnehmer (früherer Nutzerwunsch) bleibt zusätzlich bestehen und nimmt dem TCHQ einen Platz. Internationale Qualifier alle in KW 47 (Frauen KW 44), Format first to 5 (Finale 6), mehrere Plätze = Sektionen. Frauen: fiktive Spielerinnen (Ø 58–72), Spieler kann nicht teilnehmen.
- Formtiefs/Ausgaben: Werte geschätzt (Bot: ~1 Formtief pro Saison). Ausgaben werden automatisch gebucht (keine Auswahl), können nicht ins Minus treiben, da nur ab 10 Tsd. € und max. 12 % bzw. fixe Kleinbeträge.
- Level-Punkte 1 → 7: Bot-Karriere etwas langsamer (2034 OVR ~87–88 statt ~92; Tourcard eher nach 7–8 Saisons). Startalter: ältere Starter bekommen nur Erfahrung, keine Attributvorteile; Dev Tour nur bis 23, Auszug ab 18 im ersten Jahr.

## Unsichere Angaben (bei echten Daten prüfen)
- **Tourcard-Holder 2026: vom Nutzer geliefert** inkl. Herkunft: Top 64 (inkl. Michael Mansell auf 46), 31 im zweiten Kartenjahr (laufen Ende 2026 aus → Q-School), 4 CT/Dev 2025 + 29 Q-School 2026 (Karte bis 2027). Nationen, Alter, Averages geschätzt.
- Kartenregel (Nutzer): Tourcard gilt 2 Jahre; Top 64 der PDC OOM am Saisonende → +1 Jahr (bis Ende Folgejahr). Top 64 2026 starten daher mit Karte bis 2027.
- (alt) Websuche lief, aber Wikipedia/dartsnews/fandom sind im Container gesperrt → nur Suchzusammenfassungen. **Gesichert**: OOM-Top 17 (Anfang 2026), Q-School-2026-Gewinner (UK + EU), Stefan Bellmont (CT 2025), Beau Greaves (Dev 2025 Platz 2), Abgänge (de Sousa, Campbell, Jim Williams, Slevin, Klaasen, Lennon, Harrysson).
- **Aus Gedächtnis/ungeprüft**: OOM-Plätze 18–64 und Reihenfolge, Liste `TOUR_EXPIRING` (wer 2026 eine Karte hatte, aber nicht Top 64 ist) inkl. Keegan Brown, Matthew Dennant, Damian Mol, Leighton Bennett, Ben Robb, Jules van Dongen; „Samuel Price“ (Q-School UK 2026, Name laut Suche); „Marvin Kraft“ (Suche nennt auch „Martin Kraft“).
- Alle Altersangaben und Averages sind Schätzungen. Challenge-Liste vom Nutzer (Plätze 1–75); Stärke 91 Ø − 0,14/Platz; 13 Spieler stehen auch auf der Dev-Liste → nur als Dev-Spieler geführt (spielen CT mit, Average = max). Gruppe „schlecht“: 30 fiktive Europäer (66–72 Ø). Alte CT-Namen (de Sousa, Klaasen, Jim Williams …) entfernt. Start-Karten CT/Dev 2026 = Listenplatz 1–2 (Hunt, Coulson, Drayton, Beeton). Dev-Liste vom Nutzer (98 ohne Karte + 13 Holder); Stärke aus Platz (1 → 90 Ø, −0,16/Platz; „schlecht“ 285+ ≈ 72–76), Nationen/Alter geschätzt. Holder in der Dev-Liste auf 21–23 Jahre gesetzt. Dylan Slevin/Lewy Williams von Challenge → Dev (Ersatz in CT fiktiv: Thijs Hoogland, Marcel Brandt).
- Regel: Tourcard-Holder ≤ 23 außerhalb der PDC-Top-64 dürfen zusätzlich Dev Tour spielen (KI + Spieler).
- Exakte PDC-Termine/Orte 2027 (noch nicht veröffentlicht) – angenähert an 2025/2026.
- Preisgeld-Tabellen in `data/prizemoney.js` für CT/Dev/PC/ET sind Näherungswerte (noch nicht aktiv).

## Bekannte Bugs / Offene Punkte
- Manueller Modus (`matchUI.js`) deaktiviert; `manualParams` nutzt noch die alte Attribut-Skala → vor Reaktivierung neu kalibrieren (tests/humanSim.mjs).
- Google Fonts werden online geladen; offline greift die Systemschrift (Arial Narrow/Roboto Condensed).
- Manuell bei perfektem Timing sehr starke Spieler (Attribute 95) erreichen ~114 Ø – bewusst als Skill-Belohnung; ggf. in Phase 6 nachjustieren.
- Gegner-Wurftempo fest (0,52 s/Dart); Option „schnell“ evtl. in Phase 6.
- Balancing lokal: Start-Spieler (Scoring 40–45) gewinnt im ersten Jahr selten ein lokales Turnier, wenn er keine Punkte verteilt. Feinschliff in Phase 2/6.
