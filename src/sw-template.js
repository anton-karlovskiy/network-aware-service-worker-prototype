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

const ECT_RESOURCE_URLS = [
  'https://cdn.glitch.com/8d7fb7f0-a9be-4a8c-96c7-8af286af487e%2Fmax-res.jpg?v=1562842587982',
  'https://cdn.glitch.com/8d7fb7f0-a9be-4a8c-96c7-8af286af487e%2Fmedium-res.jpg?v=1562842587169',
  // 'https://cdn.glitch.com/8d7fb7f0-a9be-4a8c-96c7-8af286af487e%2Fmin-res.jpg?v=1562842586912',
  'https://cdn.glitch.com/8d7fb7f0-a9be-4a8c-96c7-8af286af487e%2Fmin-res.jpg?v=1562842586912'
];

const CACHE_VERSION = 8;

// Shorthand identifier mapped to specific versioned cache.
const CURRENT_CACHES = {
  DYNAMIC_NAME: 'ect-dynamic-v' + CACHE_VERSION
};

// self.addEventListener('activate', function(event) {
//   const expectedCacheNames = Object.values(CURRENT_CACHES);

//   // Active worker won't be treated as activated until promise
//   // resolves successfully.
//   event.waitUntil(
//     caches.keys().then(function(cacheNames) {
//       return Promise.all(
//         cacheNames.map(function(cacheName) {
//           if (!expectedCacheNames.includes(cacheName)) {
//             console.log('Deleting out of date cache:', cacheName);
            
//             return caches.delete(cacheName);
//           }
//         })
//       );
//     })
//   );
//   // ray test touch <
//   return self.clients.claim();
//   // ray test touch >
// });

// TODO: inspired by https://stackoverflow.com/questions/34640286/how-do-i-copy-a-request-object-with-a-different-url
// above approach is more correct in theory but not working as expected so simulated as following
const getCreatedRequest = (url, request) => {
  const newRequest = new Request(url, {
    destination: request.destination,
    method: request.method,
    headers: request.headers,
    referrer: request.referrer,
    referrerPolicy: request.referrerPolicy,
    mode: request.mode,
    credentials: request.credentials,
    cache: request.cache,
    redirect: request.redirect,
    integrity: request.integrity,
  });
  return newRequest;
};

// TODO: similar to stale-while-revalidate strategy but different to large extend
self.addEventListener('fetch', function(event) {
  if (ECT_RESOURCE_URLS.includes(event.request.url)) {
    console.log('ray : [sw fetch-event-listener] requesting for ECT resource event.request.url => ', event.request.url);
    event.respondWith(
      caches.open(CURRENT_CACHES.DYNAMIC_NAME).then(function(cache) {
        return cache.match(event.request).then(async function(response) {
          if (response) {
            console.log('ray : [sw fetch-event-listener] returning match-cached response');
            return response;
          } else {
            for (const ectResourceURL of ECT_RESOURCE_URLS) {
              const createdRequest = getCreatedRequest(ectResourceURL, event.request);
              const anyCachedResponse = await cache.match(createdRequest);
              // TODO: we might apply some algorithm to picking up cached ECT resource e.g in high to low of image quality order
              if (anyCachedResponse) {
                console.log('ray : [sw fetch-event-listener] returning any cached response');
                return anyCachedResponse;
              }
            }

            console.log('ray : [sw fetch-event-listener] returning fetched response');
            return fetch(event.request).then(function(networkResponse) {
              // ray test touch <
              // trimCache(CURRENT_CACHES.DYNAMIC_NAME, 5);
              // ray test touch >
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          }
        });
      })
    );
  }
});
