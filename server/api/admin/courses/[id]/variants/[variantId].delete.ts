export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  const variantId = Number(getRouterParam(event, 'variantId'))
  if (!id || !variantId) {
    throw createError({ statusCode: 400, message: 'Invalid IDs.' })
  }

  await prisma.courseVariant.delete({
    where: { id: variantId, courseId: id }
  })

  return { success: true }
})
