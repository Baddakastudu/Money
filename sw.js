// Offline helper for the Money app (v2).
// It keeps a copy of this app's own files on the phone so the app opens without internet.
// It never sends your data anywhere: it only downloads these files from GitHub.
const CACHE = "money-v4";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-180.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(req, { ignoreSearch: true });
    const net = fetch(req).then(r => { if (r && r.ok) c.put(req, r.clone()); return r; }).catch(() => null);
    if (req.mode === "navigate") {            // the app page: newest version if online (wait max 3 s), else the saved copy
      const quick = await Promise.race([net, new Promise(r => setTimeout(() => r(null), 3000))]);
      return quick || hit || (await net) || new Response("Offline — open the app once with internet first.", { status: 503 });
    }
    return hit || (await net) || new Response("", { status: 504 });
  }));
});
