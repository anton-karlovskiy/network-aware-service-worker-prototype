
// ray test touch <
if ('function' === typeof importScripts) {
  importScripts(
    // ray test touch <
    // 'https://storage.googleapis.com/workbox-cdn/releases/3.5.0/workbox-sw.js'
    'https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js'
    // ray test touch >
  );
  /* global workbox */
  if (workbox) {
    console.log('Workbox is loaded');

    /* injection point for manifest files.  */
    workbox.precaching.precacheAndRoute([]);

/* custom cache rules*/
workbox.routing.registerNavigationRoute('/index.html', {
      blacklist: [/^\/_/, /\/[^\/]+\.[^\/]+$/],
    });

workbox.routing.registerRoute(
      /\.(?:png|gif|jpg|jpeg)$/,
      workbox.strategies.cacheFirst({
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
// ray test touch >