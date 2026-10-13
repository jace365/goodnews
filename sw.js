// 파일을 고치면 VERSION을 올린다
const VERSION = 'goodnews-v8';
const FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => { self.skipWaiting(); e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES))); });
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const html = e.request.mode === 'navigate';
  if (html) { // 앱 화면은 네트워크 우선 → 새 버전 바로 반영, 오프라인이면 캐시
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put('./index.html', c)); return r; })
      .catch(() => caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
    if (r.ok && (e.request.url.startsWith(self.location.origin) || /fonts\.(googleapis|gstatic)\.com/.test(e.request.url))) {
      const c = r.clone(); caches.open(VERSION).then(x => x.put(e.request, c)); }
    return r; })));
});
