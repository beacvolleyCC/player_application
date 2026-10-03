const CACHE='club-control-player-v2-3-10-26o-p14e-team-logos-dark-yellow-splash';
const CORE=[
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-32.png',
  './icons/event-training-mask.png',
  './icons/event-home-mask.png',
  './icons/event-away-mask.png',
  './icons/avatar-sprite.webp?v=avatar60-p10',
  './assets/team-logos/beac.png?v=p14e',
  './assets/team-logos/bdseemericus.png?v=p14e',
  './assets/team-logos/bdseemericus_dark.png?v=p14e',
  './assets/team-logos/bunnies.png?v=p14e',
  './assets/team-logos/dag.png?v=p14e',
  './assets/team-logos/kando.png?v=p14e',
  './assets/team-logos/keac.png?v=p14e',
  './assets/team-logos/kispest.png?v=p14e',
  './assets/team-logos/kispest_dark.png?v=p14e',
  './assets/team-logos/kozgaz.png?v=p14e',
  './assets/team-logos/kre.png?v=p14e',
  './assets/team-logos/kse.png?v=p14e',
  './assets/team-logos/mafc.png?v=p14e',
  './assets/team-logos/mozdulj.png?v=p14e',
  './assets/team-logos/mtk.png?v=p14e',
  './assets/team-logos/ossc.png?v=p14e',
  './assets/team-logos/ossc_dark.png?v=p14e',
  './assets/team-logos/panorama.png?v=p14e',
  './assets/team-logos/panorama_dark.png?v=p14e',
  './assets/team-logos/pase.png?v=p14e',
  './assets/team-logos/rackeve.png?v=p14e',
  './assets/team-logos/rksk.png?v=p14e',
  './assets/team-logos/semmeilweis.png?v=p14e',
  './assets/team-logos/taksony.png?v=p14e',
  './assets/team-logos/ute.png?v=p14e'
];

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


/* Player V2.3.9.2 – real Web Push receiver. */
self.addEventListener('push', event => {
  let payload={title:'Club Control',body:'Új értesítés érkezett.',data:{url:'./'}};
  if(event.data){
    try{ payload={...payload,...event.data.json()}; }
    catch(_){ payload={...payload,body:event.data.text()||payload.body}; }
  }
  const options={
    body:payload.body||'',
    icon:payload.icon||'./icons/icon-192.png',
    badge:payload.badge||'./icons/icon-192.png',
    tag:payload.tag||undefined,
    renotify:!!payload.tag,
    data:{...(payload.data||{}),url:payload.url||payload.data?.url||'./'},
    timestamp:Date.now()
  };
  event.waitUntil(Promise.all([
    self.registration.showNotification(payload.title||'Club Control',options),
    clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>Promise.all(list.map(client=>{
      try{ client.postMessage({type:'CC_PUSH_RECEIVED'}); }catch(_){ }
    })))
  ]));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const raw=event.notification?.data?.url||'./';
  const target=new URL(raw,self.registration.scope).href;
  event.waitUntil((async()=>{
    const list=await clients.matchAll({type:'window',includeUncontrolled:true});
    for(const client of list){
      try{
        if('navigate' in client) await client.navigate(target);
        if('focus' in client) return client.focus();
      }catch(_){ }
    }
    return clients.openWindow ? clients.openWindow(target) : undefined;
  })());
});
