// service-worker.js
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("quarto-cache").then(cache => {
      return cache.addAll([
        "/",
        "/index.html",
        "/style.css",
        "/game.js",
        "/manifest.json",
        "/icon-192.png",
        "/icon-512.png",
        // 이미지 조각 경로도 필요하다면 여기에 추가
      ]);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});
