# Darts Career 🎯

Karrieremodus für Darts im FIFA-Stil: vom Kneipenturnier im eigenen Bundesland über DDV, Q-School, Challenge und Development Tour bis zur PDC Pro Tour, den Majors und der Weltmeisterschaft. Ein Browserspiel ohne Backend (HTML/CSS/JavaScript, ES-Module), mobil im Hochformat und am Desktop spielbar.

> **Hinweis:** Fanprojekt, **nur zur privaten Nutzung**. Das Spiel verwendet echte Spielernamen ohne Lizenz. Turnier- und Verbandsnamen dienen nur der Orientierung. Sponsoren, Amateure, DDV-Spieler und Nachwuchstalente sind fiktiv.

## Starten
- **Lokal:** im Projektordner `python3 -m http.server` ausführen und http://localhost:8000 öffnen. Per Doppelklick (`file://`) funktioniert es nicht, weil der Browser ES-Module dann blockiert.
- **GitHub Pages:** Repository veröffentlichen (Branch/Root), fertig. Es gibt keinen Build-Schritt.
- **Tests:** `node tests/run.mjs` (Node ≥ 18)

## Spielablauf
1. **Charakter erstellen:** Name, Nation, Bundesland, Wurfhand. Du startest mit 16 Jahren. Alle Attribute starten bei 60 von 100, dazu verteilst du 25 Bonuspunkte frei. Die Erfahrung startet bei −4, das Budget bei 5.000 €.
2. **Wochenkalender:** Pro Woche ein Event (die Premier League kommt zusätzlich), dann „Weiter“. Gespeichert wird automatisch nach jeder Woche.
3. **Turniere:** Jedes Match wird simuliert, entweder als **📺 DartConnect** (Aufnahme für Aufnahme, mit Störmomenten und Entscheidungen) oder als **⚡ Schnellsimulation**.
4. **Training:** Nach jedem Turnier verteilst du Punkte auf Scoring, Finishing, Mental, Fokus und Rechnen. Dazu kommt einmal pro Woche eine Trainingseinheit. Wer länger nicht trainiert, verliert an Form.
5. **Aufstieg:** Lokal und DDV, dann Q-School (Tourcard) oder Challenge/Development Tour (Top 2), dann Pro Tour und Majors. Die Tourcard gilt 2 Jahre. Wer am Saisonende in den Top 64 der PDC-Rangliste steht, bekommt jeweils 1 Jahr dazu.
6. **Sponsoren:** Ab der ersten Tourcard, höchstens 4 gleichzeitig (eine pro Kategorie), Laufzeit 1–3 Jahre, jederzeit kündbar.
7. **Karriereende:** Jederzeit über „Speichern & Menü“, mit Abschlussbilanz.

## Inhalte
- 128 Tourcard-Holder 2026 (Top 64, zweites Kartenjahr, Q-School 2026, CT/Dev 2025) sowie Challenge-, Development-, DDV- und Lokal-Spieler (`data/players.js`, leicht editierbar)
- Realistischer Jahreskalender mit 20 WDF-Opens, Q-School, 24 Challenge- und 24 Development-Turnieren, 30 Players Championships, 14 European-Tour-Events, allen Majors, World Series, World Cup und Premier League
- Ranglisten: PDC Order of Merit (2 Jahre), Pro Tour, Challenge Tour, Development Tour, Premier-League-Tabelle
- Die Spielwelt lebt: Auf- und Abstieg, Kartenverlust, Entwicklung nach Alter, Ruhestand, neue Talente
- Tour-Seite: alle Tourcard-Holder (gültig bis, Herkunft) und Titelträger aller Majors mit Siegerliste je Saison
- Team: Manager (Provision, mehr Sponsoren, Exhibitions) und Trainer (mehr XP)
- Selbstvertrauen, Erfahrung auf der großen Bühne, Gegner-Matchdarts auf der Dartscheibe, Interviews nach Majors
- Statistik-Archiv: Saisons, Titel, Bestergebnisse, Höchstplatzierungen
- Mehrere Speicher-Slots, Export und Import als JSON

## Projektstruktur
Siehe `CLAUDE.md` (Regeln, Datenmodell, Formeln) und `STATUS.md` (Stand, Annahmen, offene Punkte).
