const CACHE_NAME = 'bmc-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/Template/logo.png',
  '/Template/Birthday_Template.png',
  '/Template/Wedding_Template.png',
  '/manifest.json',
  '/service-worker.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Pacifico&family=Concert+One&family=Alice&family=Roboto&family=Lobster&display=swap'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});