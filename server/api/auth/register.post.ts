import { registerSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const {
    email,
    password,
    name,
    timeZone,
    phone,
    country,
    age
  } = await parseBody(event, registerSchema)

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw createError({ statusCode: 409, message: 'A user with this email already exists.' })
  }

  const passwordHash = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      email,
      name: name ?? null,
      passwordHash,
      timeZone: timeZone ?? null,
      phone: phone ?? null,
      country: country ?? null,
      age: age ?? null
    }
  })

  // Issue + send verification email (non-fatal if SMTP isn't configured)
  try {
    const token = await issueToken(user.id, 'email_verify')
    const link = appUrl(`/api/auth/verify-email/${token}`)
    await sendMail({
      to: user.email,
      subject: 'Verify your email',
      text: `Welcome${user.name ? ' ' + user.name : ''}! Confirm your email:\n${link}\n\nThis link expires in 24 hours.`,
      html: `<p>Welcome${user.name ? ' ' + user.name : ''}!</p><p>Confirm your email by clicking the link below:</p><p><a href="${link}">${link}</a></p><p>This link expires in 24 hours.</p>`
    })
  } catch (err) {
    console.error('[register] failed to send verification email', err)
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
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

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      timeZone: user.timeZone,
      phone: user.phone,
      country: user.country,
      age: user.age,
      isActive: user.isActive,
      isAvailableForBooking: user.isAvailableForBooking
    }
  }
})
