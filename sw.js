// CC TEST: scoped static-only cache. Never touches a production cache name.
const CACHE='cc-player-test-test-20261030-player-magiclink-v1';
const STATIC=['./','./index.html','./config.js','./app.js?v=test-20261030-player-magiclink-v1','./styles.css?v=test-20261030-player-magiclink-v1','./rsvp-reliability.js?v=20261028-rsvp-v1','./statistics.js?v=test-20261030-player-magiclink-v1','./statistics.css?v=test-20261030-player-magiclink-v1','./competition-context-catalog.js','./manifest.webmanifest','./icons/cc-test-192.png','./icons/cc-test-180.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(STATIC)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('cc-player-test-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const r=e.request,u=new URL(r.url);
 if(r.method!=='GET'||u.origin!==self.location.origin)return;
 e.respondWith(fetch(r,{cache:'no-store'}).then(response=>{
  if(response.ok&&response.type==='basic')caches.open(CACHE).then(c=>c.put(r,response.clone()));
  return response;
 }).catch(async()=>await caches.match(r)||(r.mode==='navigate'?await caches.match('./index.html'):Response.error())));
});
