// Nombre de la caché
const CACHE_NAME = 'mi-pwa-cache-v1';

// Lista de archivos que quieres precachear (cachear al instalar la PWA)
const urlsToCache = [
  './',
  '/index.html',
  '/styles.css', // O la ruta a tu archivo CSS si la tienes separada
  '/html5 cv/foto cv pwa.jpeg',
  // Agrega aquí más archivos que necesites cachear, como tus íconos
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'
];

// Evento de instalación: cuando el service worker se instala
self.addEventListener('install', event => {
  console.log('Service Worker: Evento de Instalación');
  // Espera hasta que la caché se abra y todos los archivos estén en ella
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Abriendo caché y precacheando archivos');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de activación: cuando el service worker se activa
self.addEventListener('activate', event => {
  console.log('Service Worker: Evento de Activación');
  // Elimina las cachés antiguas para evitar que ocupen espacio
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName.startsWith('mi-pwa-cache-') && cacheName !== CACHE_NAME;
        }).map(cacheName => {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

// Evento de "fetch": cuando el navegador hace una solicitud de red
self.addEventListener('fetch', event => {
  // Ignora las solicitudes que no sean de red (ej. de extensiones)
  if (event.request.url.startsWith('chrome-extension://')) {
      return;
  }
  
  // Responde desde la caché si el recurso existe, si no, busca en la red
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devuelve la respuesta de la caché si la encuentra
        if (response) {
          console.log('Service Worker: Sirviendo desde caché:', event.request.url);
          return response;
        }

        // Si no está en caché, va a la red
        console.log('Service Worker: No se encontró en caché, buscando en la red:', event.request.url);
        return fetch(event.request).then(response => {
          // Si la respuesta es válida, la clona y la guarda en la caché
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        });
      })
  );
});
