const CACHE_NAME = 'skoob-cache-v2';
const assets = [
  './',
  './index.html',
  './index.css',
  './index.js',
  './manifest.json',
  'https://cdn-icons-png.flaticon.com/512/2232/2232688.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(assets);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cachedResponse => {
      return cachedResponse || fetch(e.request);
    })
  );
});