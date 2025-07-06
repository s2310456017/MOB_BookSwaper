// Import des Barcode- und QR-Code-Readers aus externem Modul (für Kamera-Scanner)
import { BrowserMultiFormatReader } from 'https://unpkg.com/@zxing/browser@latest?module';

// Funktionen für Gamification: Nutzerstatistiken (XP, Level, Badges) aus localStorage lesen
function getUserStats() {
    return JSON.parse(localStorage.getItem("userStats")) || { xp: 0, level: 1, badges: [] };
}

// Nutzerstatistiken speichern
function saveUserStats(stats) {
    localStorage.setItem("userStats", JSON.stringify(stats));
}

// XP hinzufügen, Level up prüfen, ggf. Badge freischalten
function addXP(amount) {
    const stats = getUserStats();
    stats.xp += amount;                 // XP erhöhen
    const requiredXP = stats.level * 100; // XP für nächstes Level
    if (stats.xp >= requiredXP) {       // Level Up Bedingung
        stats.level++;                  // Level erhöhen
        stats.xp -= requiredXP;         // Überschüssige XP abziehen
        unlockBadge(`level${stats.level}`); // Passenden Level-Badge freischalten
    }
    saveUserStats(stats);               // Änderungen speichern
}

// Neue Badge freischalten (wenn noch nicht vorhanden)
function unlockBadge(id) {
    const stats = getUserStats();
    if (!stats.badges.includes(id)) {
        stats.badges.push(id);          // Badge hinzufügen
        saveUserStats(stats);           // Änderungen speichern
    }
}

// DOM-Elemente aus der Seite holen
const video = document.getElementById("video");            // Videostream für Kamera-Scan
const result = document.getElementById("result");          // Ausgabe Text (Scan-Ergebnis)
const bookInfo = document.getElementById("book-info");     // Anzeige Buchinformationen
const addBtn = document.getElementById("add-btn");         // Button zum Buch hinzufügen
const rescanBtn = document.getElementById("rescan-btn");   // Button für neuen Scan

// Variable für aktuelles gescanntes Buch und Scanner-Objekt
let currentBook = null;
let codeReader = null;
let activeStream = false; // Flag, ob Kamera-Stream gerade läuft

// Eingeloggten Nutzer aus localStorage laden (um Buch-Eigentümer zu setzen)
const user = JSON.parse(localStorage.getItem("loggedInUser"));

// Funktion zum Starten des Barcode-Scanners (falls nicht schon aktiv)
function startScanner() {
    if (activeStream) return;        // Wenn Scanner läuft, nichts tun

    // Scanner neu initialisieren
    codeReader = new BrowserMultiFormatReader();
    activeStream = true;

    // Kamera-Stream starten und auf Barcode prüfen
    codeReader.decodeFromVideoDevice(null, video, (scanResult, err) => {
        if (scanResult) {
            const isbn = scanResult.getText();  // Ausgelesene ISBN als Text
            result.textContent = `ISBN erkannt: ${isbn}`;
            fetchBookInfo(isbn);                // Buchinfos von Google Books holen
            codeReader.reset();                 // Scanner stoppen
            activeStream = false;               // Flag zurücksetzen
        }
    });
}

// Scanner direkt beim Laden starten
startScanner();

// Funktion, um Buchinfos von Google Books API zu laden anhand der ISBN
async function fetchBookInfo(isbn) {
    const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);  // API-Anfrage
    const data = await res.json();

    if (data.totalItems > 0) {  // Wenn Buch gefunden
        const info = data.items[0].volumeInfo;
        // Buch-Objekt mit wichtigen Daten befüllen
        currentBook = {
            id: "book_" + Date.now(),                    // Eindeutige ID (Zeitstempel)
            title: info.title || "Kein Titel",
            author: info.authors?.join(', ') || "Unbekannter Autor",
            description: info.description || "Keine Beschreibung verfügbar.",
            image: info.imageLinks?.thumbnail || "",
            status: "verfügbar",                          // Anfangsstatus
            owner: user?.username || "unbekannt",        // Eigentümer aus Login
        };

        // Buchinformationen in der Seite anzeigen
        bookInfo.innerHTML = `
            <h5>${currentBook.title}</h5>
            <p><strong>Autor(en):</strong> ${currentBook.author}</p>
            <p>${currentBook.description}</p>
            ${currentBook.image ? `<img src="${currentBook.image}" alt="Cover">` : ""}
        `;

        addBtn.style.display = "inline-block";  // Button zum Hinzufügen anzeigen
    } else {
        // Kein Buch gefunden: Info anzeigen, Button verstecken
        bookInfo.innerHTML = `<p> Kein Buch zur ISBN gefunden</p>`;
        currentBook = null;
        addBtn.style.display = "none";
    }
}

// Eventlistener: Wenn „Buch hinzufügen“-Button geklickt wird
addBtn.addEventListener("click", () => {
    if (!currentBook) return;        // Falls kein Buch geladen, nichts tun

    // Bücher aus localStorage holen (falls leer, leeres Array)
    const books = JSON.parse(localStorage.getItem("books")) || [];
    books.push(currentBook);         // Neues Buch hinzufügen
    localStorage.setItem("books", JSON.stringify(books));  // Speichern

    // Gamification: XP und Badge vergeben
    addXP(30);                      // 30 XP für Buch hinzufügen
    unlockBadge("contributor");     // Badge für Beitragende freischalten

    // UI-Status aktualisieren
    result.textContent = "Buch hinzugefügt!";
    bookInfo.innerHTML = "";
    addBtn.style.display = "none";
    currentBook = null;

    // Rescan-Button anzeigen, um neues Buch zu scannen
    rescanBtn.style.display = "inline-block";
});

// Eventlistener: Wenn „Neues Buch scannen“-Button gedrückt wird
rescanBtn.addEventListener("click", async () => {
    // UI leeren und Button verstecken
    result.textContent = "";
    bookInfo.innerHTML = "";
    rescanBtn.style.display = "none";

    // Kamera stoppen, falls aktiv
    if (video.srcObject) {
        const tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
    }

    // Scanner zurücksetzen und Flag setzen
    codeReader?.reset();
    activeStream = false;

    // Scanner neu starten für neuen Scan
    startScanner();
});
