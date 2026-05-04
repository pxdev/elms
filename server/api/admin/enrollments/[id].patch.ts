export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  if (!id) {
    throw createError({ statusCode: 400, message: 'Invalid enrollment ID.' })
  }

  const body = await readBody<{
    status?: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  }>(event)

  if (!body.status) {
    throw createError({ statusCode: 400, message: 'Status is required.' })
  }

  const enrollment = await prisma.enrollment.update({
    where: { id },
    data: { status: body.status }
  })

  return { enrollment }
})
