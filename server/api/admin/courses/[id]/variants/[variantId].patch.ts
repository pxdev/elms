import { updateVariantSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  const variantId = Number(getRouterParam(event, 'variantId'))
  if (!id || !variantId) {
    throw createError({ statusCode: 400, message: 'Invalid IDs.' })
  }

  const body = await parseBody(event, updateVariantSchema)

  const variant = await prisma.courseVariant.update({
    where: { id: variantId, courseId: id },
    data: {
      name: body.name?.trim(),
      sessionsPerMonth: body.sessionsPerMonth,
      price: body.price,
      isActive: body.isActive,
      lsVariantId: body.lsVariantId === undefined ? undefined : (body.lsVariantId?.trim() || null)
    }
  })

  return { variant }
})
