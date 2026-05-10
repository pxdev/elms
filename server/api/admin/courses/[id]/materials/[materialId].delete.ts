export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const materialId = Number(getRouterParam(event, 'materialId'))
  if (!materialId) {
    throw createError({ statusCode: 400, message: 'Invalid material ID.' })
  }

  await prisma.courseMaterial.delete({
    where: { id: materialId }
  })

  return { success: true }
})
