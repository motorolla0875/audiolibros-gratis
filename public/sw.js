// Audiolibros Gratis: guarda la app (no los audios ni la API) para que abra sin internet.
// Primero intenta la red; si no hay, usa la copia guardada.
const CACHE = "ag-app-v1";
const APP = ["/", "/index.html", "/app.js", "/icono.svg"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(APP)).catch(() => {})); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("ag-app-") && k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin || u.pathname.startsWith("/api/") || u.pathname.startsWith("/contenido/")) return;
  const esApp = e.request.mode === "navigate" || APP.includes(u.pathname);
  if (!esApp) return;
  const clave = e.request.mode === "navigate" ? "/" : u.pathname;
  e.respondWith(fetch(e.request).then(r => { if (r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(clave, copia)); } return r; })
    .catch(() => caches.open(CACHE).then(c => c.match(clave)).then(r => r || Response.error())));
});
