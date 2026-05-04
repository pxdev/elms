export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const courseId = Number(getRouterParam(event, 'id'))
  if (!courseId) {
    throw createError({ statusCode: 400, message: 'Invalid course ID.' })
  }

  const body = await readBody<{
    name?: string
    sessionsPerMonth?: number
    price?: number
    lsVariantId?: string
  }>(event)

  if (!body.name || body.name.trim().length === 0) {
    throw createError({ statusCode: 400, message: 'Variant name is required.' })
  }
  if (body.sessionsPerMonth === undefined || body.sessionsPerMonth < 1) {
    throw createError({ statusCode: 400, message: 'Sessions per month must be at least 1.' })
  }

  const variant = await prisma.courseVariant.create({
    data: {
      courseId,
      name: body.name.trim(),
      sessionsPerMonth: body.sessionsPerMonth,
      price: body.price ?? 0,
      lsVariantId: body.lsVariantId?.trim() || null
    }
  })

  return { variant }
})
