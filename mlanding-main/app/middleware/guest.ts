// Bounce already-authenticated visitors away from /auth/login and /auth/register.
export default defineNuxtRouteMiddleware(() => {
  const { loggedIn } = useUserSession()
  if (loggedIn.value) {
    const localePath = useLocalePath()
    return navigateTo(localePath('/dashboard'))
  }
})
