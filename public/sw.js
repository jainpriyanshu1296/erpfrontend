// Minimalist Service Worker for PWA Installation Support
// Offline mode is intentionally not enforced per requirement.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass through all requests directly to the network
  event.respondWith(fetch(event.request));
});
