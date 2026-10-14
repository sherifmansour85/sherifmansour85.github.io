/* Old site worker: nothing to cache here. */
self.addEventListener('install',function(){self.skipWaiting()});
self.addEventListener('activate',function(e){e.waitUntil(self.registration.unregister())});
