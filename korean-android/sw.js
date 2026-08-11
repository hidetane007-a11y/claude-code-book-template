const CACHE = 'korean-android-v3';
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
  './icons/icon.svg',
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
  // 外部APIとローカルAPIエンドポイントはキャッシュしない
  if (url.origin !== location.origin) return;
  if (url.pathname.includes('/api/')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res.ok && res.type !== 'opaque') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => null);
      return cached || network;
    })
  );
});
