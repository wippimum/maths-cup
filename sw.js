/* sw.js — offline service worker for World Maths Cup.
   Precaches every file so the app runs with NO internet after the first visit
   (e.g. on a plane or in Thailand). Bump CACHE + the ?v= numbers together to ship an update. */
const CACHE = 'wac-v17';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-180.png',
  './src/styles.css?v=17',
  './src/fraction.js?v=17',
  './src/format.js?v=17',
  './src/parser.js?v=17',
  './src/numbers.js?v=17',
  './src/explanations.js?v=17',
  './src/steps.js?v=17',
  './src/topics.js?v=17',
  './src/topics2.js?v=17',
  './src/topics3.js?v=17',
  './src/topics4.js?v=17',
  './src/topics5.js?v=17',
  './src/primes.js?v=17',
  './src/coords.js?v=17',
  './src/solving.js?v=17',
  './src/problems.js?v=17',
  './src/app.js?v=17'
];

self.addEventListener('install', (e) => {
  // fetch each asset with {cache:'reload'} so a stale browser copy is never cached
  e.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(ASSETS.map((url) =>
        fetch(new Request(url, { cache: 'reload' }))
          .then((resp) => { if (resp && resp.ok) return cache.put(url, resp); })
          .catch(() => {})
      ))
    ).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Cache-first: serve from the device, fall back to the network, then to index.html.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) =>
      hit || fetch(e.request).catch(() => caches.match('./index.html'))
    )
  );
});
