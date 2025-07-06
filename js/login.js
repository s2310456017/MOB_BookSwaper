// Import der statisch definierten Benutzer aus users.js
import { users } from "./users.js";

// Eventlistener für das Login-Formular (Submit-Event)
document.getElementById("login-form").addEventListener("submit", (evt) => {
    evt.preventDefault(); // Standard-Formular-Submit verhindern (kein Seitenreload)

    // Eingaben aus Formular auslesen und Leerzeichen trimmen
    const uname = document.getElementById("username").value.trim();
    const pwd = document.getElementById("password").value.trim();
    const errorDiv = document.getElementById("login-error"); // Div für Fehleranzeige

    // Benutzer in der Users-Liste suchen mit passendem Username + Passwort
    const user = users.find(
        (u) => u.username === uname && u.password === pwd
    );

    if (user) {
        // Erfolgreiches Login

        // Eingeloggten Benutzer im localStorage speichern (JSON-String)
        localStorage.setItem("loggedInUser", JSON.stringify(user));

        // Prüfen, ob es eine Benachrichtigung für diesen Benutzer gibt (key: notification_username)
        const notificationKey = "notification_" + user.username;
        const message = localStorage.getItem(notificationKey);

        if (message) {
            alert(message);                // Nachricht per Popup anzeigen
            localStorage.removeItem(notificationKey); // Nachricht danach löschen
        }

        // Nach erfolgreichem Login auf Startseite weiterleiten
        window.location.href = "../index.html";
    } else {
        // Login fehlgeschlagen: Fehlermeldung im errorDiv anzeigen
        errorDiv.textContent = "Benutzername oder Passwort ist falsch.";
    }
});
