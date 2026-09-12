const CACHE='club-control-player-v2-3-5-7-planner-entry';
const CORE=['./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  const isAppFile = url.origin===self.location.origin && (
    event.request.mode==='navigate' ||
    /\/(index\.html|app\.js|styles\.css|config\.js)$/.test(url.pathname)
  );

  if(isAppFile){
    event.respondWith(
      fetch(event.request, {cache:'no-store'})
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(event.request,copy));
          return response;
        })
        .catch(()=>caches.match(event.request).then(r=>r||caches.match('./index.html')))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached=>cached || fetch(event.request).then(response=>{
      if(url.origin===self.location.origin){
        const copy=response.clone();
        caches.open(CACHE).then(cache=>cache.put(event.request,copy));
      }
      return response;
    }))
  );
});


/* V2 push receiver shell. No notification is generated until a real push backend exists. */
self.addEventListener('push', event => {
  if(!event.data) return;
  let payload={};
  try{ payload=event.data.json(); }catch(_){ payload={title:'Club Control',body:event.data.text()}; }
  event.waitUntil(self.registration.showNotification(payload.title||'Club Control',{
    body:payload.body||'',
    icon:payload.icon||'./icons/icon-192.png',
    badge:payload.badge||'./icons/icon-192.png',
    data:payload.data||{}
  }));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const target=event.notification?.data?.url||'./';
  event.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{
    const existing=list.find(client=>'focus' in client);
    if(existing){ existing.navigate?.(target); return existing.focus(); }
    return clients.openWindow ? clients.openWindow(target) : undefined;
  }));
});
