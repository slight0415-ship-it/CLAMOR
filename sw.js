/* CLAMOR v320: latest successful same-origin resources, offline fallback */
const CACHE_NAME='clamor-cache-v320';
const CORE=['./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE_NAME).then(c=>Promise.allSettled(CORE.map(u=>c.add(u)))));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('clamor-cache-')&&k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
 e.respondWith((async()=>{
  try{const r=await fetch(e.request);if(r.ok){const c=await caches.open(CACHE_NAME);await c.put(e.request,r.clone());}return r;}
  catch(err){return await caches.match(e.request)||(e.request.mode==='navigate'?await caches.match('./index.html'):null)||new Response('Offline: resource unavailable',{status:503});}
 })());
});
