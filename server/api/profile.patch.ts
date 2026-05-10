import { updateProfileSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)

  const body = await parseBody(event, updateProfileSchema)

  const data: any = {
    name: body.name?.trim(),
    avatarUrl: body.avatarUrl?.trim(),
    timeZone: body.timeZone?.trim(),
    phone: body.phone?.trim(),
    country: body.country?.trim(),
    age: body.age
  }

  if (body.isAvailableForBooking !== undefined) {
    data.isAvailableForBooking = body.isAvailableForBooking
  }

  if (body.password) {
    data.passwordHash = await hashPassword(body.password)
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data
  })

  await setUserSession(event, {
    user: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      timeZone: updated.timeZone,
      phone: updated.phone,
      country: updated.country,
      age: updated.age,
      isActive: updated.isActive,
      isAvailableForBooking: updated.isAvailableForBooking
    } as any,
    loggedInAt: Date.now()
  })

  return { user: updated }
})
