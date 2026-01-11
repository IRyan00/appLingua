const CACHE_NAME = "lingua-app-v1";
const urlsToCache = ["/", "/manifest.json", "/icon-192.svg", "/icon-512.svg"];

// Installation du service worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error("Cache installation failed:", error);
      })
  );
  self.skipWaiting();
});

// Activation du service worker
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  return self.clients.claim();
});

// Interception des requêtes
self.addEventListener("fetch", (event) => {
  // Ne pas intercepter les requêtes non-GET
  if (event.request.method !== "GET") {
    return;
  }

  // Ignorer les requêtes non-HTTP(S) (chrome-extension, data:, blob:, etc.)
  try {
    const url = new URL(event.request.url);
    if (!url.protocol.startsWith("http")) {
      return;
    }
  } catch (error) {
    // Si l'URL est invalide, ignorer la requête
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retourner la réponse du cache si disponible, sinon faire une requête réseau
      return (
        response ||
        fetch(event.request)
          .then((response) => {
            // Vérifier si la réponse est valide
            if (
              !response ||
              response.status !== 200 ||
              response.type !== "basic"
            ) {
              return response;
            }

            // Vérifier à nouveau que la requête est HTTP(S) avant de mettre en cache
            const requestUrl = new URL(event.request.url);
            if (requestUrl.protocol.startsWith("http")) {
              // Cloner la réponse pour la mettre en cache
              const responseToCache = response.clone();

              // Mettre en cache seulement les requêtes HTTP(S)
              caches
                .open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache).catch(() => {
                    // Ignorer les erreurs de cache silencieusement
                  });
                })
                .catch(() => {
                  // Ignorer les erreurs d'ouverture de cache
                });
            }

            return response;
          })
          .catch((error) => {
            // En cas d'erreur réseau, retourner la réponse du cache si disponible
            return response || new Response("Network error", { status: 408 });
          })
      );
    })
  );
});
