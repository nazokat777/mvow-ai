/**
 * M·VoW Service Worker — offline support so the app works without internet
 * after first load. Caches all preview HTML files + the logo.
 */

const CACHE_NAME = 'mvow-v3.5.0';
const ASSETS = [
  './',
  './gallery.html',
  './welcome.html',
  './goal.html',
  './voice-commitment.html',
  './permissions.html',
  './done.html',
  './home.html',
  './daily-brief.html',
  './calendar.html',
  './profile.html',
  './notifications.html',
  './settings.html',
  './add-session.html',
  './session-start.html',
  './hard-lock.html',
  './online-class.html',
  './urgent-time.html',
  './negotiation.html',
  './chat.html',
  './session-reflection.html',
  './stuck.html',
  './weekly-review.html',
  './rest-mode.html',
  './celebrate.html',
  './day-flow.html',
  './tomorrow-plan.html',
  './morning-confirm.html',
  './pomodoro.html',
  './routine.html',
  './assets/mnsm-logo.png',
  './manifest.webmanifest',
  './nav-overlay.js',
  './menu.html',
  './index.html'
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
