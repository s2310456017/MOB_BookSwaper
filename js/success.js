document.addEventListener("DOMContentLoaded", () => {
    // XP, das für ein Level benötigt wird
    const xpPerLevel = 100;

    // Definition der möglichen Badges mit id, Namen und Beschreibung
    const badges = [
        { id: "first-book", name: "Erstes Buch", description: "Du hast dein erstes Buch hinzugefügt!" },
        { id: "borrower", name: "Ausleiher", description: "Du hast ein Buch ausgeliehen." },
        { id: "lender", name: "Verleiher", description: "Ein anderes Mitglied hat dein Buch ausgeliehen." }
    ];

    // Eingeloggten Benutzer aus localStorage laden
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    // Wenn kein Nutzer angemeldet, abbrechen (keine UI-Anzeige)
    if (!loggedInUser) return;

    const username = loggedInUser.username;
    // Alle Bücher aus localStorage laden oder leeres Array, wenn keines vorhanden
    const books = JSON.parse(localStorage.getItem("books")) || [];

    // Nutzer-spezifischen Key für die Statistiken im localStorage generieren
    const statsKey = `userStats_${username}`;
    // Nutzerstatistiken laden oder Standard-Objekt mit XP, Level und Badges
    let userStats = JSON.parse(localStorage.getItem(statsKey)) || {
        xp: 0,
        level: 1,
        badges: []
    };

    // === Fortschritt berechnen ===
    // Bücher, die der Nutzer hochgeladen hat
    const uploaded = books.filter(b => b.owner === username);
    // Bücher, die der Nutzer ausgeliehen hat
    const borrowed = books.filter(b => b.borrowedBy === username);
    // Bücher, die der Nutzer verliehen hat (Status "vergeben")
    const loanedOut = books.filter(b => b.owner === username && b.status === "vergeben");

    // Funktion: Badge vergeben und XP hinzufügen, falls Badge noch nicht vorhanden
    function grantBadge(badgeId, xp = 50) {
        if (!userStats.badges.includes(badgeId)) {
            userStats.badges.push(badgeId);  // Badge hinzufügen
            userStats.xp += xp;               // XP hinzufügen
        }
    }

    // Badges für Bedingungen vergeben:
    if (uploaded.length >= 1) grantBadge("first-book");    // Erstes Buch hochgeladen
    if (borrowed.length >= 1) grantBadge("borrower");      // Buch ausgeliehen
    if (loanedOut.length >= 1) grantBadge("lender");       // Buch verliehen

    // Neue Statistiken im localStorage speichern (benutzerspezifisch)
    localStorage.setItem(statsKey, JSON.stringify(userStats));

    // === UI-Aktualisierung ===
    // Level berechnen (XP geteilt durch XP pro Level)
    const level = Math.floor(userStats.xp / xpPerLevel) + 1;
    // XP im aktuellen Level (Rest XP)
    const currentXP = userStats.xp % xpPerLevel;
    // Prozentualer Fortschritt für die Fortschrittsanzeige
    const progressPercent = (currentXP / xpPerLevel) * 100;

    // Level-Text aktualisieren
    document.getElementById("user-level").textContent = level;
    // Fortschrittsbalken Breite setzen
    document.getElementById("progress-bar").style.width = `${progressPercent}%`;
    // Text mit XP-Informationen setzen
    document.getElementById("xp-info").textContent = `${currentXP} von ${xpPerLevel} XP`;

    // Container für Badges leeren
    const container = document.getElementById("badges-container");
    container.innerHTML = "";

    // Für jedes Badge eine Karte (card) erzeugen
    badges.forEach(badge => {
        // Prüfen, ob Nutzer das Badge besitzt
        const hasBadge = userStats.badges.includes(badge.id);
        const badgeDiv = document.createElement("div");
        badgeDiv.className = "col s12 m4";  // Responsive Spalten-Layout (Materialize CSS)
        // HTML der Karte mit Namen und Beschreibung, Farbe abhängig von Besitz
        badgeDiv.innerHTML = `
            <div class="card ${hasBadge ? "teal" : "grey lighten-2"}">
              <div class="card-content white-text">
                <span class="card-title">${badge.name}</span>
                <p>${badge.description}</p>
              </div>
            </div>
        `;
        // Karte dem Container hinzufügen
        container.appendChild(badgeDiv);
    });
});
