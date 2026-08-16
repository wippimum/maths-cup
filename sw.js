/* sw.js — offline service worker for World Maths Cup.
   Precaches every file so the app runs with NO internet after the first visit
   (e.g. on a plane or in Thailand). Bump CACHE + the ?v= numbers together to ship an update.

   Strategy: NETWORK-FIRST for code (html/css/js/json), CACHE-FIRST for big binary assets.
   Cache-first on code means an installed iPad keeps serving yesterday's build for ever and
   a fix looks like it did nothing — so code always tries the network, and falls back to the
   cache the moment the network isn't there, which is what keeps offline working. */
const CACHE = 'wac-v33';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './version.json',
  './icon-180.png',
  './src/styles.css?v=33',
  './src/fraction.js?v=33',
  './src/format.js?v=33',
  './src/parser.js?v=33',
  './src/numbers.js?v=33',
  './src/explanations.js?v=33',
  './src/figures.js?v=33',
  './src/steps.js?v=33',
  './src/topics.js?v=33',
  './src/topics2.js?v=33',
  './src/topics3.js?v=33',
  './src/topics4.js?v=33',
  './src/topics5.js?v=33',
  './src/primes.js?v=33',
  './src/coords.js?v=33',
  './src/history.js?v=33',
  './src/numeracy1.js?v=33',
  './src/algebra1.js?v=33',
  './src/curriculum1.js?v=33',
  './src/curriculum2.js?v=33',
  './src/harder.js?v=33',
  './src/harder2.js?v=33',
  './src/bidmas.js?v=33',
  './src/solving.js?v=33',
  './src/problems.js?v=33',
  './src/app.js?v=33'
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

const IS_BINARY = /\.(png|jpe?g|gif|svg|webp|ico|woff2?|ttf|mp3|wav)$/i;

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Images/fonts/sounds barely change: serve them straight off the device.
  if (IS_BINARY.test(url.pathname)) {
    e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
    return;
  }

  // Code and pages: newest wins when online, the cache carries it when offline.
  e.respondWith(
    fetch(e.request)
      .then((resp) => {
        if (resp && resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        }
        return resp;
      })
      .catch(() =>
        caches.match(e.request).then((hit) => hit || caches.match('./index.html'))
      )
  );
});
