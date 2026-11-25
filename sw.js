// Offline helper for the Money app.
// It only stores this app's own files on the phone so the app opens without internet.
// It never sends your data anywhere: it only downloads these files from GitHub.
const CACHE = "money-v1";
const FILES = ["./", "./index.html", "./shiftpay.html", "./expenses.html", "./manifest.webmanifest", "./icon-180.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// Open from the phone's copy straight away; if online, quietly refresh that copy for next time.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(req, { ignoreSearch: true });
    const net = fetch(req).then(r => { if (r && r.ok) c.put(req, r.clone()); return r; }).catch(() => null);
    return hit || (await net) || new Response("Offline and not saved yet — open the app once with internet.", { status: 503 });
  }));
});
