/**
 * M·VoW Service Worker — offline support so the app works without internet
 * after first load. Caches all preview HTML files + the logo.
 */

const CACHE_NAME = 'mvow-v26.0.0';
const ASSETS = [
  './',
  // Asosiy infratuzilma
  './index.html',
  './data.js',
  './theme.css',
  './motion.css',
  './motion.js',
  './i18n.js',
  './lang-switcher.js',
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
  './maqsad.html',            // (maqsad qo'shish)
  './maqsadlar.html',         // 4 (maqsadlar ro'yhati)
  './settings.html',          // 5 (Sozlamalar + Ruxsatlar birlashtirilgan)
  './alarm.html',             // 6
  './home.html',              // 7
  './hard-lock.html',         // 11 (taymer)
  './session-reflection.html',// 12 (bajardim)
  './kechqurun.html',         // 13 (kechki sharh)
  './weekly-review.html',     // 14 (natijalar)
  './celebrate.html'          // 15 (bayram)
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
  const raw = (event.notification.data && event.notification.data.url) || 'alarm.html';
  // Absolute URL — service worker scope'ga nisbatan
  const targetUrl = new URL(raw, self.registration.scope).href;

  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });

    // 1) Agar shunday URL bilan oyna ochiq bo'lsa — fokus
    for (const client of allClients) {
      if (client.url === targetUrl && 'focus' in client) {
        return client.focus();
      }
    }

    // 2) Bo'lmasa — mavjud oynani topib, postMessage bilan navigatsiya
    for (const client of allClients) {
      if (client.url.startsWith(self.registration.scope.replace(/\/$/, ''))) {
        try {
          await client.focus();
          // Page tomonida message listener bor (data.js'da)
          client.postMessage({ type: 'mvow.navigate', url: targetUrl });
          // Yana navigate ham urinib ko'ramiz (ikki yo'l)
          try { await client.navigate(targetUrl); } catch {}
          return;
        } catch {}
      }
    }

    // 3) Hech qanday oyna yo'q — yangi ochish
    if (self.clients.openWindow) {
      return self.clients.openWindow(targetUrl);
    }
  })());
});

// Push event (kelajak uchun, server yuborgan push'larni qo'llab-quvvatlash)
self.addEventListener('push', event => {
  let data = { title: "Uyg'oning", body: 'Vaqt keldi. Misolni yeching.', url: './alarm.html' };
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
