importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js');

workbox.googleAnalytics.initialize();

const assets = [ // == cachefirst
  'site.webmanifest',
  // ,'assets/img/favicons/apple-touch-icon.png'
  // ,'assets/img/favicons/favicon-32x32.png'

  'https://fonts.googleapis.com/css?family=Roboto:300,400,500,700'
  ,'https://cdn.jsdelivr.net/npm/@mdi/font@4.x/css/materialdesignicons.min.css'
  ,'https://cdn.jsdelivr.net/npm/vue@2.x/dist/vue.min.js'
  ,'https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.css'
  ,'https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.js'
  // ,'https://cdn.jsdelivr.net/npm/echarts@4.1.0/dist/echarts.js'
  // ,'https://cdn.jsdelivr.net/npm/vue-echarts@4.0.2'
];

// -------------------------------------- precacheAndRoute = cache-first
workbox.precaching.precacheAndRoute(assets);


// NOTES
// 
// regular expressions from work begin with exact match, 
// if the beginning should not match, add .+ in front
// 
// if you use new RegExp(''), you need to double escape characters, 
// RegExp('\\\\') -> \\ -> \
// don't need that with the /.../ notation
// 

// =============================================================== STATIC
// ------------------------------------------------- NetworkFirst
workbox.routing.registerRoute( /\//, // everything that begins with a slash = everything that is in the folders from this server.
  new workbox.strategies.NetworkFirst({ cacheName: 'static-nf', }) );

// ------------------------------------------------- StaleWhileRevalidate
workbox.routing.registerRoute(
//   /\.(?:css|js)/, // doesn't work for cross origin
  new RegExp('.+\\.(css|js|png)$'),
  new workbox.strategies.StaleWhileRevalidate({ cacheName: 'static-swr', }) );


workbox.routing.registerRoute( 
  /.+\.woff/,
  new workbox.strategies.CacheFirst({ cacheName: 'fonts-cf', }) );


// // Cache the Google Fonts stylesheets with a stale-while-revalidate strategy.
// workbox.routing.registerRoute(
//   /^https:\/\/fonts\.googleapis\.com/,
//   new workbox.strategies.StaleWhileRevalidate({
//     cacheName: 'google-fonts-stylesheets',
//   })
// );
// // Cache the underlying font files with a cache-first strategy for 1 year.
// workbox.routing.registerRoute(
//   /^https:\/\/fonts\.gstatic\.com/,
//   new workbox.strategies.CacheFirst({
//     cacheName: 'google-fonts-webfonts',
//     plugins: [
//       new workbox.cacheableResponse.Plugin({
//         statuses: [0, 200],
//       }),
//       new workbox.expiration.Plugin({
//         maxAgeSeconds: 60 * 60 * 24 * 365,
//         maxEntries: 30,
//       }),
//     ],
//   })
// );



// ALL THE REST
workbox.routing.registerRoute(
  new RegExp('.+'),
  new workbox.strategies.StaleWhileRevalidate({
    cacheName: 'allTheRest-swr',
  })
);

