// X3 ÉLITE — Service Worker v6.1
// Cache offline completo para Android

const CACHE_NAME = 'x3-elite-v6.1';
const STATIC_CACHE = 'x3-static-v6.1';
const API_CACHE = 'x3-api-v6.1';

// Assets críticos para funcionamiento offline
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/apple-touch-icon.png',
];

// Instalar: cachear assets críticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Error cacheando assets estáticos:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activar: limpiar caches viejos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== API_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: estrategia por tipo de request
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API calls: Network first, fallback a respuesta offline
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/trpc/')) {
    event.respondWith(networkFirstWithOfflineFallback(event.request));
    return;
  }

  // Google Fonts: Cache first
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }

  // Assets estáticos (JS, CSS, imágenes): Cache first, luego network
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff|woff2|ttf)$/) ||
    url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(cacheFirst(event.request, STATIC_CACHE));
    return;
  }

  // Navegación (HTML): Network first, fallback a / cacheado
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match('/').then((r) => r || new Response('X3 — Sin conexión. Reconectando...', { headers: { 'Content-Type': 'text/html' } }))
      )
    );
    return;
  }

  // Default: Network first
  event.respondWith(networkFirst(event.request));
});

// ── Estrategias de cache ──────────────────────────

async function cacheFirst(request, cacheName = STATIC_CACHE) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('', { status: 503 });
  }
}

async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch {
    // Respuesta offline para el chat
    if (request.url.includes('/api/stream-chat') || request.url.includes('chat.send')) {
      return new Response(
        JSON.stringify({
          result: {
            data: {
              content: '⚡ X3 en modo offline. Sin conexión a internet. Reconéctate para usar el análisis IA completo. Los módulos de datos locales (Isapres, simulador) siguen disponibles.',
              conversationId: null,
            }
          }
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }
    const cached = await caches.match(request);
    return cached || new Response(JSON.stringify({ error: 'Sin conexión' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Mensaje de actualización disponible
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
