
// ray test touch <
if ('function' === typeof importScripts) {
  importScripts(
    'https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js'
  );
  /* global workbox */
  if (workbox) {
    console.log('Workbox is loaded!');

    /* injection point for manifest files.  */
    workbox.precaching.precacheAndRoute([]);

    /* custom cache rules*/
    workbox.routing.registerNavigationRoute('/index.html', {
      blacklist: [/^\/_/, /\/[^\/]+\.[^\/]+$/],
    });

    workbox.routing.registerRoute(
      /\.(?:png|gif|jpg|jpeg)$/,
      new workbox.strategies.CacheFirst({
        cacheName: 'images',
        plugins: [
          new workbox.expiration.Plugin({
            maxEntries: 60,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
          }),
        ],
      })
    );
  } else {
    console.log('Workbox could not be loaded. No Offline support');
  }
}

// workbox.routing.registerRoute(
//   new RegExp('/cdn.glitch.com/'),
//   new workbox.strategies.CacheFirst()
// );

// workbox.routing.registerRoute(
//   new RegExp('/cdn.glitch.com/'),
//   workbox.strategies.CacheFirst({
//     cacheName: 'abc',
//     plugins: [
//       new workbox.expiration.Plugin({
//         maxEntries: 50
//       })
//     ]
// }));

const CACHE_DYNAMIC_NAME = 'dynamic-v4';
self.addEventListener('fetch', function(event) {
  const url = 'https://cdn.glitch.com/';
  if (event.request.url.indexOf(url) > -1) {
    console.log('ray : ***** cdn.glitch.com asset detect');
    event.respondWith(
      caches.match(event.request)
        .then(function (response) {
          if (response) {
            console.log('ray : ***** cache response');
            return response;
          } else {
            return fetch(event.request)
              .then(function (res) {
                console.log('ray : ***** fetch response');
                return caches.open(CACHE_DYNAMIC_NAME)
                  .then(function (cache) {
                    // trimCache(CACHE_DYNAMIC_NAME, 3);
                    console.log('ray : ***** fetch then cache');
                    cache.put(event.request.url, res.clone());
                    return res;
                  });
              });
          }
        })
    );
  }
});
// ray test touch >
