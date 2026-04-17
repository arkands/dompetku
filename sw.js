// ===========================
// DOMPETKU – sw.js (Service Worker)
// Tugasnya: bikin aplikasi bisa jalan offline
// ===========================

const CACHE_NAME = 'dompetku-v1';

// File-file yang disimpan untuk offline
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap'
];

// Saat Service Worker pertama kali dipasang → simpan semua file
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('📦 Menyimpan file untuk offline...');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Saat versi baru Service Worker aktif → hapus cache lama
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Saat aplikasi meminta file → coba dari internet dulu, kalau gagal pakai cache
self.addEventListener('fetch', event => {
  // Jangan cache request ke Google Apps Script (data selalu harus segar)
  if (event.request.url.includes('script.google.com')) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Kalau berhasil dari internet, perbarui cache juga
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => {
        // Kalau internet mati, gunakan cache yang sudah tersimpan
        return caches.match(event.request);
      })
  );
});
