/* نگهبان آفلاین بایگانی اطلاعات */
const CACHE_NAME = 'baygani-v1';
const PRECACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

/* نصب: فایل‌های اصلی را در حافظه پنهان بگذار */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(PRECACHE.map(p => cache.add(p)))
    )
  );
  self.skipWaiting();
});

/* فعال‌سازی: کش‌های قدیمی را پاک کن */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

/* رهگیری درخواست‌ها */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  /* فایل‌های خود سایت: اول از کش، اگر نبود از اینترنت */
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request).then(hit =>
        hit || fetch(e.request).then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
          return res;
        }).catch(() => caches.match('./index.html'))
      )
    );
    return;
  }

  /* منابع بیرونی (فونت و کتابخانه‌ها): اول اینترنت، اگر نبود از کش */
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request))
  );
});