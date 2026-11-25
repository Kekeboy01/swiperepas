/* La version de test /v6/ est terminée : ce service worker se retire et efface ses caches. */
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('swipe-repas-v6-')).map(x=>caches.delete(x)))).then(()=>self.registration.unregister())));
