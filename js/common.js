document.addEventListener("DOMContentLoaded", () => {

  // Aus dem localStorage den aktuell eingeloggten Benutzer laden (wenn vorhanden)
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  // Menü-Elemente holen – evtl. auf manchen Seiten nicht vorhanden
  const menuLogin = document.getElementById("menu-login");          // Link für Login
  const menuLogout = document.getElementById("menu-logout");        // Link für Logout
  const menuMyBooks = document.getElementById("menu-mybooks");      // Link zu „Meine Bücher“
  const menuAddBook = document.getElementById("menu-addbook");      // Link zum Hinzufügen neuer Bücher
  const menuSuccess = document.getElementById("menu-success");      // Link zur Erfolge-/Gamification-Seite
  const logoutLink = document.querySelector("#menu-logout a");      // tatsächlicher <a>-Link im Logout-Menü
  const loginLogoutBtn = document.getElementById("login-logout-btn"); // Haupt-Login-/Logout-Button (z. B. Startseite)

  // Wenn ein Benutzer eingeloggt ist:
  if (user) {
    // Login-Menüpunkt ausblenden (nicht mehr nötig)
    if (menuLogin) menuLogin.style.display = "none";

    // Restliche Menüpunkte anzeigen, die nur für eingeloggte Nutzer relevant sind
    if (menuLogout) menuLogout.style.display = "block";
    if (menuMyBooks) menuMyBooks.style.display = "block";
    if (menuAddBook) menuAddBook.style.display = "block";
    if (menuSuccess) menuSuccess.style.display = "block";

    // Logout über Menü-Link
    if (logoutLink) {
      logoutLink.addEventListener("click", (e) => {
        e.preventDefault(); // Standard-Linkverhalten unterdrücken
        localStorage.removeItem("loggedInUser"); // Benutzer aus dem Speicher löschen
        window.location.href = "/index.html"; // Zurück zur Startseite
      });
    }

    // Logout über den Haupt-Button (falls vorhanden)
    if (loginLogoutBtn) {
      loginLogoutBtn.textContent = "Abmelden"; // Text anpassen
      loginLogoutBtn.onclick = () => {
        localStorage.removeItem("loggedInUser"); // Benutzer löschen
        window.location.reload(); // Seite neu laden (zurück in ausgeloggten Zustand)
      };
    }

  } else {
    // Kein Benutzer eingeloggt: nur Login anzeigen, Rest ausblenden
    if (menuLogin) menuLogin.style.display = "block";        // Login anzeigen
    if (menuLogout) menuLogout.style.display = "none";       // Logout ausblenden
    if (menuMyBooks) menuMyBooks.style.display = "none";     // Meine Bücher ausblenden
    if (menuAddBook) menuAddBook.style.display = "none";     // AddBook ausblenden
    if (menuSuccess) menuSuccess.style.display = "none";     // Gamification-Seite ausblenden

    // Klick auf Haupt-Button leitet zur Login-Seite weiter
    if (loginLogoutBtn) {
      loginLogoutBtn.textContent = "Jetzt anmelden & Bücher tauschen"; // Text setzen
      loginLogoutBtn.onclick = () => {
        window.location.href = "/pages/login.html"; // Weiterleitung zum Login
      };
    }
  }
});
