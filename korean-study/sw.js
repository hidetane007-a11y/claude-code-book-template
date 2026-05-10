const CACHE = 'korean-study-v1';
const PRECACHE = [
  './',
  './index.html',
  './conversation.html',
  './drill.html',
  './vowels.html',
  './wordbook.html',
  './css/app.css',
  './js/state.js',
  './js/speech.js',
  './js/nav.js',
  './js/offline-engine.js',
  './data/scripts/cafe.json',
  './data/scripts/airport.json',
  './data/scripts/restaurant.json',
  './data/scripts/shopping.json',
  './data/scripts/directions.json',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './manifest.json',
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).catch(() => {})
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(keys =>
        Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
      )
    ])
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok && res.type !== 'opaque') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => {
        if (e.request.destination === 'document') {
          return caches.match('./index.html');
        }
        return new Response('Offline', { status: 503 });
      });
    })
  );
});
