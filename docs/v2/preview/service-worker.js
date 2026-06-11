/**
 * M·VoW Service Worker — offline support so the app works without internet
 * after first load. Caches all preview HTML files + the logo.
 */

const CACHE_NAME = 'mvow-v13.0.0';
const ASSETS = [
  './',
  // Asosiy infratuzilma
  './index.html',
  './data.js',
  './i18n.js',
  './nav-overlay.js',
  './manifest.webmanifest',
  './menu.html',
  './gallery.html',
  './about.html',
  './royhat.html',
  './assets/mnsm-logo.png',
  // 17 ekran SEQ tartibida
  './intro.html',             // 1
  './anketa.html',            // 2
  './vada.html',              // 3
  './permissions.html',       // 4
  './settings.html',          // 5
  './alarm.html',             // 6
  './home.html',              // 7
  './routine.html',           // 8
  './today-plan.html',        // 9
  './rejalar.html',           // 10 (hafta/oy/yil)
  './calendar.html',          // 11
  './day-flow.html',          // 11
  './hard-lock.html',         // 12
  './negotiation.html',       // 13
  './session-reflection.html',// 14
  './kechqurun.html',         // 15 (kechki sharh)
  './notifications.html',     // 16
  './weekly-review.html',     // 16
  './celebrate.html'          // 17
];

// Install — pre-cache all app assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS).catch(err => {
        // Don't fail install if one asset is missing
        console.warn('[SW] Some assets failed to cache:', err);
      }))
      .then(() => self.skipWaiting())
  );
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch — network-first for HTML/JS (always fresh), cache-first for images/fonts
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Network-first for Google Fonts (cache fallback if offline)
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // For our own files: HTML & JS always fetched fresh (network-first).
  // Images/manifest cache-first (fast, rarely change).
  if (url.origin === location.origin) {
    const path = url.pathname;
    const isHtmlOrJs = path.endsWith('.html') || path.endsWith('.js') || path === '/' || path.endsWith('/');

    if (isHtmlOrJs) {
      // Network first — updates appear instantly
      event.respondWith(
        fetch(event.request)
          .then(response => {
            if (response && response.status === 200) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
            }
            return response;
          })
          .catch(() => caches.match(event.request).then(c => c || caches.match('./gallery.html')))
      );
    } else {
      // Static assets (images, manifest) — cache first for speed
      event.respondWith(
        caches.match(event.request)
          .then(cached => cached || fetch(event.request).then(response => {
            if (response && response.status === 200) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then(c => c.put(event.request, copy));
            }
            return response;
          }))
      );
    }
  }
});

// ──────────────────────────────────────────────────────────────
// NOTIFICATIONS — bildirishnoma boslsa, alarm.html'ga olib boradi
// ──────────────────────────────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || './alarm.html';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Agar ilov ochiq bo'lsa, alarm sahifasiga olib boramiz
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(url).catch(() => {});
          return client.focus();
        }
      }
      // Aks holda yangi oyna ochish
      if (self.clients.openWindow) return self.clients.openWindow(url);
    })
  );
});

// Push event (kelajak uchun, server yuborgan push'larni qo'llab-quvvatlash)
self.addEventListener('push', event => {
  let data = { title: "Uyg'on", body: 'Vaqt keldi. Misolni yech.', url: './alarm.html' };
  try { if (event.data) data = Object.assign(data, event.data.json()); } catch {}
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: './assets/mnsm-logo.png',
      badge: './assets/mnsm-logo.png',
      vibrate: [500, 200, 500, 200, 500, 200, 500],
      tag: 'wake-alarm',
      requireInteraction: true,
      data: { url: data.url }
    })
  );
});
