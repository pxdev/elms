// One-shot cleanup for the service worker we used to ship under
// @vite-pwa/nuxt. The module is gone; the SW files it installed
// (dev-sw.js, workbox-*.js) are not. Visitors who loaded the site
// under the old config still have an SW cached which keeps asking
// for updates, and Vue Router emits a "No match found" warning for
// each of those in-flight requests.
//
// This plugin unregisters every registration and nukes every
// cache under the site's origin on first load, then stays quiet.
// Cost: ~1 ms on every page visit for the check; an extra ~10 ms
// once in the visitor's lifetime to actually do the work.

export default defineNuxtPlugin(async () => {
  if (typeof window === 'undefined') return
  if (!('serviceWorker' in navigator)) return

  try {
    const regs = await navigator.serviceWorker.getRegistrations()
    if (regs.length === 0) return

    await Promise.all(regs.map(r => r.unregister()))

    // Kill any caches the old SW owned so they don't serve stale assets
    // on the next navigation.
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map(k => caches.delete(k)))
    }

    console.info('[sw-cleanup] removed legacy PWA service worker + caches')
  } catch (err) {
    // Non-fatal — if this fails the user can clear site data manually.
    console.warn('[sw-cleanup] failed to unregister service worker', err)
  }
})
