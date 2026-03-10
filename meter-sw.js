const CACHE = 'pozometre-v1';
const BASE = '/pozometre';
const ASSETS = [
  BASE + '/',
  BASE + '/index.html',
  BASE + '/meter-manifest.json',
  BASE + '/icon-192.png',
  BASE + '/icon-512.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(ASSETS.map(u => c.add(u)))));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (!e.request.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.match(e.request).then(cached => cached ||
      fetch(e.request).then(resp => {
        if (resp && resp.status === 200) {
          caches.open(CACHE).then(c => c.put(e.request, resp.clone()));
        }
        return resp;
      }).catch(() => caches.match(BASE + '/index.html'))
    )
  );
});
