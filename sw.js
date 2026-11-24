// sw.js — 名画収集館 Service Worker
const CACHE = 'meiga-v3';

const STATIC = [
  '/',
  '/index.html',
  '/app.js',
  '/manifest.json',
  '/icon.jpg',
  '/icon-192.jpg',
  '/icon-512.jpg',
  '/ogp.jpg',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(STATIC.map(url => new Request(url, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('meiga-') && k !== CACHE)
      .map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

async function cacheResponse(request, response) {
  if (response.ok) {
    try {
      const cache = await caches.open(CACHE);
      await cache.put(request, response.clone());
    } catch (error) {
      console.warn('キャッシュに保存できませんでした', error);
    }
  }
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.status >= 500) return (await caches.match(request)) || response;
    return cacheResponse(request, response);
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;
    throw error;
  }
}

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;

  // 次回起動時に新しいコードと作品一覧を取得。オフライン時は前回の成功分を使う。
  if (e.request.mode === 'navigate' || url.pathname === '/app.js' || url.pathname.startsWith('/api/')) {
    e.respondWith(networkFirst(e.request));
    return;
  }

  // 画像はstale-while-revalidate
  if (url.pathname.startsWith('/images/')) {
    const fresh = fetch(e.request).then(response => cacheResponse(e.request, response));
    e.waitUntil(fresh.catch(() => {}));
    e.respondWith(caches.match(e.request).then(cached => cached || fresh));
    return;
  }

  // 静的アセット：キャッシュ優先
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
