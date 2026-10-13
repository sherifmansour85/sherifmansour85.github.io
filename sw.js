/* Hayakkom service worker: install-ability only. No caching, no interception: every request goes straight to the network. */
self.addEventListener('install',function(){self.skipWaiting()});
self.addEventListener('activate',function(e){e.waitUntil(self.clients.claim())});
self.addEventListener('fetch',function(){});
