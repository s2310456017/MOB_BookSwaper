// Import der Standard-Bücherdaten (z. B. aus bookdata.js, für ersten App-Start)
import { books as defaultBooks } from './bookdata.js';

document.addEventListener("DOMContentLoaded", () => {
    // Aktuell eingeloggter Benutzer (aus localStorage)
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    // DOM-Elemente referenzieren
    const loginLogoutBtn = document.getElementById("login-logout-btn");
    const loginMenuItem = document.getElementById("menu-login");
    const bookListContainer = document.getElementById("book-list");
    const detailContainer = document.getElementById("detail-content");
    const bookListSection = bookListContainer.parentElement;
    const detailSection = document.getElementById("book-detail");
    const backButton = document.getElementById("back-to-list");

    // Bücher aus localStorage laden oder mit Default initialisieren
    function loadBooks() {
        let storedBooks = localStorage.getItem("books");
        if (storedBooks) {
            return JSON.parse(storedBooks); // Lokale Bücher laden
        } else {
            localStorage.setItem("books", JSON.stringify(defaultBooks)); // Bei Erstaufruf: Default-Bücher speichern
            return defaultBooks;
        }
    }

    // Bücher in localStorage speichern
    function saveBooks(books) {
        localStorage.setItem("books", JSON.stringify(books));
    }

    // Initiale Bücherliste
    let books = loadBooks();

    // XP hinzufügen (Gamification)
    function addXP(amount) {
        const stats = JSON.parse(localStorage.getItem("userStats")) || { xp: 0, level: 1, badges: [] };
        stats.xp += amount;
        localStorage.setItem("userStats", JSON.stringify(stats));
    }

    // Abzeichen freischalten (Gamification)
    function unlockBadge(id) {
        const stats = JSON.parse(localStorage.getItem("userStats")) || { xp: 0, level: 1, badges: [] };
        if (!stats.badges.includes(id)) {
            stats.badges.push(id);
            localStorage.setItem("userStats", JSON.stringify(stats));
        }
    }

    // Bücherliste im UI rendern
    function renderBookList() {
        bookListContainer.innerHTML = ""; // Vorher leeren
        books.forEach(book => {
            const isOwner = loggedInUser && book.owner === loggedInUser.username;

            const html = `
                <div class="card-panel teal lighten-5 row book-item" data-id="${book.id}" style="cursor: pointer; position: relative;">
                    <div class="col s3">
                        <img src="${book.cover || book.image || ''}" alt="Cover" style="width: 100%;">
                    </div>
                    <div class="col s9">
                        <div class="book-title"><strong>${book.title}</strong></div>
                        <div class="book-author">von ${book.author}</div>
                    </div>
                </div>
            `;
            bookListContainer.insertAdjacentHTML("beforeend", html);
        });
    }

    renderBookList(); // Beim Start direkt Bücher anzeigen

    // Klickverhalten für Liste (Details oder Löschen)
    bookListContainer.addEventListener("click", (e) => {
        // Wenn Löschbutton geklickt
        if (e.target.classList.contains("delete-book-btn")) {
            const bookId = e.target.getAttribute("data-id");
            if (confirm("Willst du dieses Buch wirklich löschen?")) {
                books = books.filter(b => b.id !== bookId);
                saveBooks(books);
                renderBookList();
            }
            e.stopPropagation(); // Kein Klick auf Detailansicht
            return;
        }

        // Klick auf Buch für Detailansicht
        const bookEl = e.target.closest(".book-item");
        if (!bookEl) return;

        // Nur eingeloggte User dürfen Details sehen
        if (!loggedInUser) {
            alert("Bitte zuerst einloggen, um die Buchdetails sehen zu können.");
            return;
        }

        // Buchdaten holen und anzeigen
        const bookId = bookEl.getAttribute("data-id");
        const book = books.find(b => b.id === bookId);
        if (!book) return;

        showBookDetails(book);
    });

    // Zurück zur Bücherliste
    backButton.addEventListener("click", (e) => {
        e.preventDefault();
        detailSection.style.display = "none";
        bookListSection.style.display = "block";
    });

    // Buchdetails anzeigen (mit Ausleihen/Rückgabe/Löschen)
    function showBookDetails(book) {
        detailContainer.innerHTML = `
            <div class="card-panel white">
                <h5>${book.title}</h5>
                <p><strong>Autor:</strong> ${book.author}</p>
                <img src="${book.cover || book.image || ''}" style="max-width: 150px;">
                <p><strong>Beschreibung:</strong><br>${book.description}</p>
                <p><strong>Standort:</strong> Online-Regal</p>
                <p><strong>Status:</strong> ${book.status.charAt(0).toUpperCase() + book.status.slice(1)}</p>
                <div id="book-action"></div>
            </div>
        `;

        const actionContainer = detailContainer.querySelector("#book-action");

        // --- Aktionen für Eigentümer ---
        if (book.owner === loggedInUser.username) {
            // Nur löschen, wenn nicht ausgeliehen
            if (book.status === "verfügbar") {
                const deleteBtn = document.createElement("button");
                deleteBtn.className = "btn white-text";
                deleteBtn.style.backgroundColor = "#cbb799";
                deleteBtn.innerText = "Buch löschen";
                deleteBtn.addEventListener("click", () => {
                    if (confirm("Möchtest du dieses Buch wirklich löschen?")) {
                        books = books.filter(b => b.id !== book.id);
                        saveBooks(books);
                        renderBookList();
                        detailSection.style.display = "none";
                        bookListSection.style.display = "block";
                    }
                });
                actionContainer.appendChild(deleteBtn);
            } else {
                // Wenn ausgeliehen → Info anzeigen
                const info = document.createElement("p");
                info.style.color = "#cbb799";
                info.innerHTML = "<em>Dieses Buch ist aktuell verliehen und kann nicht gelöscht werden.</em>";
                actionContainer.appendChild(info);
            }

            const ownerInfo = document.createElement("p");
            ownerInfo.innerHTML = `<em>Du bist der Eigentümer dieses Buchs.</em>`;
            actionContainer.appendChild(ownerInfo);

            // --- Aktionen für Fremde Nutzer ---
        } else if (book.status === "verfügbar") {
            const borrowBtn = document.createElement("button");
            borrowBtn.className = "btn white-text";
            borrowBtn.style.backgroundColor = "#cbb799";
            borrowBtn.innerText = "Ausleihen";
            borrowBtn.addEventListener("click", () => {
                addXP(20); // XP fürs Ausleihen
                unlockBadge("borrower");

                alert("Du kannst das Buch nun ausleihen. Ein kleiner Beitrag von 2 € wird deinem Konto belastet.");
                book.status = "vergeben";
                book.borrowedBy = loggedInUser.username;

                // Benachrichtigung für Eigentümer speichern
                const notification = ` ${loggedInUser.fullName} hat dein Buch "${book.title}" ausgeliehen.`;
                localStorage.setItem("notification_" + book.owner, notification);

                saveBooks(books);
                renderBookList();
                showBookDetails(book);
            });
            actionContainer.appendChild(borrowBtn);

        } else if (book.status === "vergeben") {
            // Wenn man selbst ausgeliehen hat → Rückgabe möglich
            if (book.borrowedBy === loggedInUser.username) {
                const returnBtn = document.createElement("button");
                returnBtn.className = "btn white-text";
                returnBtn.style.backgroundColor = "#b3a186";
                returnBtn.innerText = "Zurückgeben";
                returnBtn.addEventListener("click", () => {
                    addXP(10); // XP fürs Zurückgeben

                    book.status = "verfügbar";
                    delete book.borrowedBy;

                    // Benachrichtigung für Eigentümer über Rückgabe
                    const notification = ` ${loggedInUser.fullName} hat dein Buch "${book.title}" zurückgegeben.`;
                    localStorage.setItem("notification_" + book.owner, notification);

                    saveBooks(books);
                    renderBookList();
                    showBookDetails(book);
                });
                actionContainer.appendChild(returnBtn);
            } else {
                // Buch ist ausgeliehen von jemand anderem
                const info = document.createElement("p");
                info.innerHTML = `<em>Derzeit nicht verfügbar</em>`;
                actionContainer.appendChild(info);
            }
        }

        // Umschalten von Listenansicht auf Detailansicht
        bookListSection.style.display = "none";
        detailSection.style.display = "block";
    }
});

// Service Worker Registrierung (für Offline-Funktionalität)
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js")
        .then(registration => {
            console.log("Service Worker registered with scope:", registration.scope);
        })
        .catch(error => {
            console.error("Service Worker registration failed", error);
        });
}
