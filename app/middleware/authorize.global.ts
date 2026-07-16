import type { Role } from '~~/prisma/generated/client/client'

export default defineNuxtRouteMiddleware((to) => {
  const { loggedIn, user } = useUserSession()

  // Guest-only pages redirect logged-in users to dashboard
  if (to.meta.guest === true && loggedIn.value) {
    return navigateTo('/dashboard')
  }

  // No authorization required
  const authorize = to.meta.authorize as boolean | Role[] | undefined
  if (!authorize) return

  // Must be authenticated
  if (!loggedIn.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }

  // Any authenticated user is fine
  if (authorize === true) return

  // Role-based check
  if (Array.isArray(authorize) && !authorize.includes(user.value?.role as Role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden'
    })
  }
})
