// Service Worker for Abzarestan PWA
// Version 1.0.0

const CACHE_NAME = 'abzarestan-v1';
const RUNTIME_CACHE = 'abzarestan-runtime';

// فایل‌های اصلی که باید کش شوند
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/css/main.css',
  '/css/variables.css',
  '/css/base.css',
  '/css/layout/grid.css',
  '/css/components/header.css',
  '/css/components/buttons.css',
  '/css/components/cards.css',
  '/js/main.js',
  '/assets/logo/logo.svg',
  '/assets/images/head-banner.png',
  '/assets/Font/font.css',
  '/pwa/manifest.json',
  '/pwa/icons/256.png',
  '/pwa/icons/512.png'
];

// نصب Service Worker و کش کردن فایل‌های استاتیک
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// فعال‌سازی Service Worker و پاک کردن کش‌های قدیمی
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      })
  );
});

// استراتژی Fetch: Cache First با Network Fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // فقط درخواست‌های همان origin را کش کن
  if (url.origin !== location.origin) {
    return;
  }

  // برای صفحات HTML از Network First استفاده کن
  if (request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // کش کردن نسخه جدید
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // اگر آفلاین بود، از کش استفاده کن
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // اگر در کش نبود، صفحه آفلاین را نمایش بده
              return caches.match('/');
            });
        })
    );
    return;
  }

  // برای سایر فایل‌ها از Cache First استفاده کن
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then((response) => {
            // اگر درخواست موفق بود، در کش ذخیره کن
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }

            const responseClone = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });

            return response;
          })
          .catch((error) => {
            console.error('[SW] Fetch failed:', error);
            // می‌توانید یک fallback response برگردانید
            return new Response('آفلاین هستید', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain; charset=utf-8'
              })
            });
          });
      })
  );
});

// مدیریت پیام‌ها از صفحه اصلی
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

// مدیریت sync برای درخواست‌های پس‌زمینه
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(
      // اینجا می‌توانید داده‌ها را همگام‌سازی کنید
      Promise.resolve()
    );
  }
});

// مدیریت نوتیفیکیشن‌ها
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'پیام جدید از ابزارستان',
    icon: '/pwa/icons/icon-192x192.png',
    badge: '/pwa/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    dir: 'rtl',
    lang: 'fa'
  };

  event.waitUntil(
    self.registration.showNotification('ابزارستان', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('[SW] Service Worker loaded');
