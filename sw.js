/* Hayakkom service worker. Every request goes straight to the network; the only things cached are a small
   offline page and its icon, shown when a page cannot load (needed for the Android app on Google Play). */
var OFFLINE = 'hk-offline-v1';
self.addEventListener('install',function(e){e.waitUntil(caches.open(OFFLINE).then(function(c){return c.addAll(['/offline.html','/icon-192.png'])}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(n){return n!==OFFLINE}).map(function(n){return caches.delete(n)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener('fetch',function(e){
  var r=e.request;
  if(r.mode==='navigate'){e.respondWith(fetch(r).catch(function(){return caches.match('/offline.html')}))}
  else if(r.url===self.location.origin+'/icon-192.png'){e.respondWith(fetch(r).catch(function(){return caches.match(r)}))}
});
