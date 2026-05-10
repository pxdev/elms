// Thin wrapper around nuxt-auth-utils' useUserSession() — single import path
// for the rest of the app, plus a couple of convenience refs.

export function useSession() {
  const { user, loggedIn, session, fetch, clear } = useUserSession()
  const isAdmin = computed(() => Boolean(user.value?.isAdmin))
  const displayName = computed(() => {
    if (!user.value) return ''
    const f = user.value.firstName || ''
    const l = user.value.lastName || ''
    return `${f} ${l}`.trim() || user.value.email
  })
  return { user, loggedIn, isAdmin, displayName, session, fetch, clear }
}
