const CACHE = 'korean-android-v2';
const PRECACHE = [
  '/korean-android/',
  '/korean-android/index.html',
  '/korean-android/conversation.html',
  '/korean-android/drill.html',
  '/korean-android/vowels.html',
  '/korean-android/wordbook.html',
  '/korean-android/css/app.css',
  '/korean-android/js/state.js',
  '/korean-android/js/speech.js',
  '/korean-android/js/nav.js',
  '/korean-android/icons/icon.svg',
  '/korean-android/manifest.json',
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
  if (url.pathname.startsWith('/api/')) return;

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
