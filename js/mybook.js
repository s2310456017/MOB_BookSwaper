// Import der statisch definierten Bücher aus bookdata.js als Default-Datensatz
import { books as defaultBooks } from './bookdata.js';

document.addEventListener("DOMContentLoaded", () => {
    // Eingeloggten Benutzer aus localStorage laden
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    // Container für hochgeladene Bücher (Eigene Bücher)
    const uploadedContainer = document.getElementById("my-uploaded-books");
    // Container für ausgeliehene Bücher (Fremde Bücher, die ich ausgeliehen habe)
    const borrowedContainer = document.getElementById("my-borrowed-books");

    // Bücher aus localStorage laden (oder Default-Daten initialisieren)
    function loadBooks() {
        let storedBooks = localStorage.getItem("books");
        if (storedBooks) {
            return JSON.parse(storedBooks);  // gespeicherte Bücher zurückgeben
        } else {
            // Wenn keine Bücher im Speicher, dann Default-Bücher speichern & zurückgeben
            localStorage.setItem("books", JSON.stringify(defaultBooks));
            return defaultBooks;
        }
    }

    // Bücher im localStorage speichern
    function saveBooks(books) {
        localStorage.setItem("books", JSON.stringify(books));
    }

    // Bücher laden (entweder aus Speicher oder Default)
    const books = loadBooks();

    // Falls kein User eingeloggt: Hinweis anzeigen, dass man sich anmelden muss
    if (!loggedInUser) {
        uploadedContainer.innerHTML = `<p>Bitte zuerst <a href="login.html">anmelden</a>, um eigene Bücher zu sehen.</p>`;
        borrowedContainer.innerHTML = '';
        return;  // Keine weitere Ausführung, da kein Nutzer angemeldet
    }

    // Alle Bücher filtern, die der eingeloggte Nutzer hochgeladen (besitzt)
    const myUploadedBooks = books.filter(book => book.owner === loggedInUser.username);

    // Alle Bücher filtern, die vom Nutzer ausgeliehen wurden (Status "vergeben" und borrower = Nutzer)
    const myBorrowedBooks = books.filter(book => book.borrowedBy === loggedInUser.username && book.status === "vergeben");

    // Anzeige der hochgeladenen Bücher
    if (myUploadedBooks.length === 0) {
        uploadedContainer.innerHTML = `<p>Du hast noch keine Bücher hochgeladen.</p>`;
    } else {
        uploadedContainer.innerHTML = ''; // Container vorher leeren
        myUploadedBooks.forEach(book => {
            let actionHtml = '';
            if (book.status === "verfügbar") {
                // Wenn Buch verfügbar: Löschen-Button anzeigen
                actionHtml = `<button class="btn btn-small delete-btn white-text" style="background-color: #cbb799;" data-id="${book.id}">Löschen</button>`;
            } else {
                // Wenn Buch ausgeliehen: Hinweis anzeigen
                actionHtml = `<span style="color:  #cbb799; font-style: italic;">Dieses Buch ist gerade ausgeliehen.</span>`;
            }
            // HTML für jedes Buch mit Titel, Status und Aktionen
            const html = `
                <div class="card-panel white">
                    <h6>${book.title}</h6>
                    <p><strong>Status:</strong> ${book.status}</p>
                    <div class="right-align">
                        ${actionHtml}
                    </div>
                </div>
            `;
            // Buch-HTML in den Container einfügen
            uploadedContainer.insertAdjacentHTML("beforeend", html);
        });
    }

    // Anzeige der ausgeliehenen Bücher
    if (myBorrowedBooks.length === 0) {
        borrowedContainer.innerHTML = `<p>Du hast aktuell keine Bücher ausgeliehen.</p>`;
    } else {
        borrowedContainer.innerHTML = ''; // Container vorher leeren
        myBorrowedBooks.forEach(book => {
            // HTML mit Titel, Status, Eigentümer und "Zurückgeben"-Button
            const html = `
                <div class="card-panel white">
                    <h6>${book.title}</h6>
                    <p><strong>Status:</strong> ${book.status}</p>
                    <p><strong>Eigentümer:</strong> ${book.owner}</p>
                    <div class="right-align">
                        <button class="btn btn-small return-btn white-text" style="background-color: #cbb799;" data-id="${book.id}">Zurückgeben</button>
                    </div>
                </div>
            `;
            borrowedContainer.insertAdjacentHTML("beforeend", html);
        });
    }

    // Eventlistener für Klicks im ausgeliehenen Bücher-Container (Delegation)
    borrowedContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("return-btn")) {
            // Buch-ID aus Button-Attribut auslesen
            const bookId = e.target.getAttribute("data-id");
            // Passendes Buch finden (muss ausgeliehen sein von eingeloggtem Nutzer)
            const book = books.find(b => b.id === bookId && b.borrowedBy === loggedInUser.username);
            if (book) {
                // Buchstatus auf verfügbar setzen (Rückgabe)
                book.status = "verfügbar";
                // ausgeliehene Person entfernen
                delete book.borrowedBy;

                // Eigentümer benachrichtigen, dass Buch zurückgegeben wurde
                const notification = ` ${loggedInUser.fullName} hat dein Buch "${book.title}" zurückgegeben.`;
                localStorage.setItem("notification_" + book.owner, notification);

                // Bücher speichern und Seite neu laden, um Anzeige zu aktualisieren
                saveBooks(books);
                location.reload();  // Neu laden der Seite (einfachste Methode)
            }
        }
    });

    // Eventlistener für Klicks im eigenen Bücher-Container (Delegation)
    uploadedContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("delete-btn")) {
            // Buch-ID aus Button-Attribut auslesen
            const bookId = e.target.getAttribute("data-id");
            // Index des Buches im Array finden (nur eigenes Buch darf gelöscht werden)
            const index = books.findIndex(b => b.id === bookId && b.owner === loggedInUser.username);
            if (index !== -1) {
                // Buch aus Array entfernen
                books.splice(index, 1);
                // Bücher speichern
                saveBooks(books);
                // Seite neu laden, um Anzeige zu aktualisieren
                location.reload();
            }
        }
    });
});
