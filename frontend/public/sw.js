const CACHE_NAME = "lingua-app-v1";
const urlsToCache = ["/", "/manifest.json"];

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

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retourner la réponse du cache si disponible, sinon faire une requête réseau
      return (
        response ||
        fetch(event.request).then((response) => {
          // Vérifier si la réponse est valide
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Cloner la réponse pour la mettre en cache
          const responseToCache = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
      );
    })
  );
});
