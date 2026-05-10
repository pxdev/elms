export default defineOAuthGoogleEventHandler({
  config: {
    scope: ['email', 'profile']
  },
  async onSuccess(event, { user: googleUser }) {
    const email = googleUser.email
    if (!email) {
      throw createError({ statusCode: 400, message: 'Google account has no email.' })
    }

    const verified = Boolean((googleUser as { email_verified?: boolean }).email_verified)
    const now = new Date()

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        googleId: googleUser.sub,
        name: googleUser.name ?? undefined,
        avatarUrl: googleUser.picture ?? undefined,
        ...(verified ? { emailVerified: true, emailVerifiedAt: now } : {})
      },
      create: {
        email,
        name: googleUser.name ?? null,
        googleId: googleUser.sub,
        avatarUrl: googleUser.picture ?? null,
        emailVerified: verified,
        emailVerifiedAt: verified ? now : null
      }
    })

    await setUserSession(event, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
        timeZone: user.timeZone,
        phone: user.phone,
        country: user.country,
        age: user.age,
        isActive: user.isActive,
        isAvailableForBooking: user.isAvailableForBooking
      } as any,
      loggedInAt: Date.now()
    })

    return sendRedirect(event, '/dashboard')
  },
  onError(event, error) {
    console.error('Google OAuth error', error)
    return sendRedirect(event, '/login?error=oauth')
  }
})
