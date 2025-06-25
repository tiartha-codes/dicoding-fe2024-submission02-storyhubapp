import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { BASE_URL } from './config';

// Melakukan precache pada asset build
const manifest = self.__WB_MANIFEST;
precacheAndRoute(manifest);

// Caching font Google dengan strategi CacheFirst
registerRoute(
  ({ url }) => {
    return url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com';
  },
  new CacheFirst({
    cacheName: 'google-fonts',
  }),
);

// Caching avatar dari ui-avatars.com dengan strategi CacheFirst
registerRoute(
  ({ url }) => {
    return url.origin === 'https://ui-avatars.com';
  },
  new CacheFirst({
    cacheName: 'avatars-api',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
);

// Caching API utama (selain gambar) dengan strategi NetworkFirst
registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(BASE_URL);
    return baseUrl.origin === url.origin && request.destination !== 'image';
  },
  new NetworkFirst({
    cacheName: 'storyhub-api',
  }),
);

// Caching gambar dari API dengan strategi StaleWhileRevalidate
registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(BASE_URL);
    return baseUrl.origin === url.origin && request.destination === 'image';
  },
  new StaleWhileRevalidate({
    cacheName: 'storyhub-api-images',
  }),
);

// Caching tile map dari maptiler dengan strategi CacheFirst
registerRoute(
  ({ url }) => {
    return url.origin.includes('maptiler');
  },
  new CacheFirst({
    cacheName: 'maptiler-api',
  }),
);

// Menangani event push notification dan menampilkan notifikasi
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'StoryHubApp';
  const options = {
    body: data.body || 'Ada update baru di StoryHub!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png'
  };
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});