// Service worker : rend l'app installable et accélère le démarrage.
//
// L'app elle-même (index.html) et les données ne sont JAMAIS mises en cache :
// elles partent toujours au réseau, donc tout est à jour.
// Seules les ressources externes qui changent rarement (bibliothèque Supabase,
// polices) sont gardées : elles sont servies tout de suite depuis le cache et
// rafraîchies en arrière-plan.
const CACHE = "ressources-v1";
const HOTES = ["cdn.jsdelivr.net", "fonts.googleapis.com", "fonts.gstatic.com"];

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    for (const n of await caches.keys()) if (n !== CACHE) await caches.delete(n);
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  /* la page de l'appli : toujours revalidée auprès du serveur (GitHub la déclare valable
     10 min, une nouvelle version mettait jusqu'à 10 min à arriver sur le téléphone) */
  if (req.mode === "navigate") {
    e.respondWith(fetch(req.url, {cache: "no-cache", credentials: "same-origin"}).catch(() => fetch(req)));
    return;
  }
  if (req.method !== "GET" || !HOTES.includes(new URL(req.url).hostname)) {
    e.respondWith(fetch(req));
    return;
  }
  e.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const enCache = await cache.match(req);
    const reseau = fetch(req)
      .then((rep) => { if (rep.ok || rep.type === "opaque") cache.put(req, rep.clone()); return rep; })
      .catch(() => enCache);
    return enCache || reseau;
  })());
});
