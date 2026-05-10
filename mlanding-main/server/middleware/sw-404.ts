// 404 for leftover service-worker paths.
//
// An earlier version of this site shipped @vite-pwa/nuxt and installed a
// service worker. The module has been removed, but visitors who loaded the
// site back then still have the SW cached and it periodically fetches
// /dev-sw.js and /workbox-<hash>.js checking for updates. Without this
// middleware those requests fall through to the SPA, Vue Router fails to
// match them, and the dev log fills with "No match found" warnings.
//
// We answer 404 before the SPA layer gets involved. The browser takes that
// as "SW gone" and stops retrying after a few tries. The client-side
// plugins/sw-cleanup.client.ts completes the story by unregistering the SW
// on the next page load.

const SW_PATHS = /^\/(dev-sw(\.js|.*)|workbox-[a-z0-9]+\.js)$/

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname
  if (SW_PATHS.test(path)) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
})
