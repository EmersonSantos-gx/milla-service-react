const CACHE_NAME = 'milla-service-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Nunca interceptar chamadas da API ou Mercado Pago
  if (url.pathname.startsWith('/api/') || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});