import { createVariantSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const courseId = Number(getRouterParam(event, 'id'))
  if (!courseId) {
    throw createError({ statusCode: 400, message: 'Invalid course ID.' })
  }

  const body = await parseBody(event, createVariantSchema)

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
