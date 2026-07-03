const CACHE = "zerin-wedding-v4";
const urlsToCache = [
  "/",
  "/pages/holud.html",
  "/pages/wedding.html",
  "/pages/reception.html",
  "/pages/downloads.html",
  "/css/style.css",
  "/js/shared.js",
  "/js/gallery.js",
  "/js/data.js",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
