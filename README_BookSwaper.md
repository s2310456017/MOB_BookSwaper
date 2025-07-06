# BookSwaper

BookSwaper ist eine nachhaltige, installierbare Bücher-Tauschplattform als Progressive Web App (PWA). Nutzer:innen können kostenlos Bücher ausleihen, verleihen und mit einem Gamification-System Belohnungen erhalten – alles direkt im Browser, auch offline.



## Idee & Ziel

Viele Bücher verstauben nach einmaliger Nutzung im Regal oder landen im Müll. BookSwaper fördert eine Kreislaufwirtschaft für Bücher und erleichtert den Zugang zu Bildung. Die App richtet sich an:

- Studierende & Schüler:innen (Fachbücher)
- Familien & Eltern (Kinderbücher)
- Viel-Leser:innen & Leseratten
- Nachhaltigkeitsbewusste Menschen
- Lehrkräfte & Pädagog:innen
- Menschen mit geringem Einkommen



## Funktionen

-  **Öffentliche Bücherliste** (auch ohne Login sichtbar)
-  **Login** (lokal simuliert mit statischer Userliste)
-  **ISBN-Scanner** per Kamera (Google Books API)
-  **Buchdetails & Statusanzeige** (verfügbar / vergeben)
-  **Buch ausleihen & zurückgeben** 
-  **Eigene Bücher verwalten**
-  **Benachrichtigungen** beim Ausleihen & Zurückgeben
-  **Gamification-System** mit XP, Level & Badges
-  **Offlinefähig & installierbar** (PWA mit Service Worker)



## Architektur & Technologie

| Schicht         | Technologie                         | Zweck                                                  |
|----------------|--------------------------------------|--------------------------------------------------------|
| Client          | HTML5, CSS3, Vanilla JavaScript      | Grundstruktur, Logik                                   |
| UI Framework    | Materialize CSS                      | Responsives, modernes UI                              |
| Scanner         | ZXing JavaScript Library             | Kamera-Scanner zur ISBN-Erkennung                     |
| API             | Google Books API                     | Titel, Autor, Cover automatisch laden                 |
| Speicher        | localStorage                         | Speicherung von Büchern, Nutzer, XP etc.              |
| Offlinefähig    | Service Worker                       | Caching, offline Nutzung                              |
| PWA             | Manifest + Service Worker            | Homescreen-Installation, App-Feeling                  |




## Gamification

BookSwaper belohnt Interaktion:

| Aktion                   | XP  | Badge-ID      |
|--------------------------|-----|----------------|
| Erstes Buch hochladen    | 50  | `first-book`   |
| Buch ausleihen           | 50  | `borrower`     |
| Eigenes Buch verliehen   | 50  | `lender`       |
| Buch zurückgeben         | 10  | —              |

- XP = Erfahrungspunkte, 100 XP = 1 Level
- Fortschritt & Badges einsehbar in `success.html`



## Installation und Inbetriebnahme

### Voraussetzungen

- Webbrowser (Chrome, Firefox, Edge, Safari)
- Optional: Smartphone mit Kamera


### Login-Daten (Testnutzer)

Benutzername: lara
Passwort: 1234

Benutzername: max
Passwort: pwmax

Benutzername: felix
Passwort: abcd


### PWA-Installation

#### Auf Desktop:

1. Öffne `index.html` im Browser
2. Klicke auf „App installieren“-Symbol in der Adresszeile

#### Auf Smartphone:

1. Öffne App in Chrome
2. „Zum Startbildschirm hinzufügen“ → bestätigen


## Reset der Daten

Zurücksetzen durch:

- Browserkonsole:
\`\`\`js
localStorage.clear()
\`\`\`
- oder DevTools → Application → localStorage → „Clear“



## Mögliche Erweiterungen (Roadmap)

-  Standortbasierte Suche nach Büchern
-  Direktnachrichten zwischen Nutzer:innen
-  Sicheres Login über Firebase/Auth
-  Cloud-Datenbank statt LocalStorage
-  Statistikseite (Top-Verleiher, meistgelesene Bücher)



## Autorinnen

- Lisa Reindl
- Nina Zeugswetter

Erstellt im Rahmen der Lehrveranstaltung **MOB4 - Mobile Web Apps SS25**  
FH Hagenberg – Dozent: FH-Prof. DI (FH) Dr. Johannes Schönböck




## Projektstatus

Aktiv entwickelt  
Abgabetermin: 6. Juli 2025  
Präsentation: 8. Juli 2025

