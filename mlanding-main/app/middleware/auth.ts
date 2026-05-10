// Route guard for authenticated portal pages.
// Used by /dashboard/** and /admin/** layouts via definePageMeta.
export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn } = useUserSession()
  if (!loggedIn.value) {
    const localePath = useLocalePath()
    return navigateTo(`${localePath('/auth/login')}?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
