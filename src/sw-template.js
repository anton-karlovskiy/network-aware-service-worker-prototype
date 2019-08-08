/*
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

// ray test touch <
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
