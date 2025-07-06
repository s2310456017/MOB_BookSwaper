const CACHE_NAME = "book-swaper-cache-v1";
// Name des aktuellen Caches (für Versionierung / spätere Updates)

const CACHED_URLS = [
    // Liste aller Ressourcen, die beim Installieren in den Cache gespeichert werden
    "css/materialize.min.css",
    "css/styles.css",
    "https://fonts.googleapis.com/icon?family=Material+Icons", // externe Schriftart
    "https://fonts.gstatic.com/s/materialicons/v143/flUhRq6tzZclQEJ-Vdg-IuiaDsNc.woff2", // Font-Datei
    "img/BookSwaper_Logo.png",
    "js/app.js",
    "js/common.js",
    "js/materialize.min.js",
    "index.html",
    "/", // Root-Seite
    "manifest.webmanifest"
];


// Install-Event: Cache alle notwendigen Dateien beim ersten Laden
self.addEventListener("install", event => {
    console.log("[SW] Installing Service Worker...");
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            // Öffnet Cache und speichert alle URLs aus CACHED_URLS
            return cache.addAll(CACHED_URLS);
        }).catch(err => {
            // Falls Fehler beim Caching → Installation abbrechen
            console.error("[SW] Failed to cache during install:", err);
            throw err;
        })
    );
});


// Activate-Event: Alte Caches löschen
self.addEventListener("activate", event => {
    console.log("[SW] Activating Service Worker...");
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(name => {
                    // Wenn Cache-Name nicht dem aktuellen entspricht → löschen
                    if (name !== CACHE_NAME && name.startsWith("book-swaper-cache")) {
                        console.log("[SW] Deleting old cache:", name);
                        return caches.delete(name);
                    }
                })
            );
        })
    );
});


// Fetch-Event: Network First mit speziellen Offline-Fallbacks
self.addEventListener("fetch", event => {
    // Nur GET-Anfragen behandeln (keine POSTs, PUTs etc.)
    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(networkResponse => {
                // Erfolgreiche Netzwerkanfrage → direkt zurückgeben
                // (könnte hier auch in den Cache gelegt werden, dynamisch)
                return networkResponse;
            })
            .catch(() => {
                // Bei Netzwerkfehler (offline o. ä.):

                // Für Seitenaufrufe (Navigation, z. B. index.html)
                if (
                    event.request.mode === "navigate" || // Navigation (Browser lädt eine Seite)
                    (event.request.url.endsWith("index.html") || event.request.url.endsWith("/"))
                ) {
                    return caches.match("index.html"); // Aus dem Cache bedienen
                }
            })
    );
});

