export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  if (!id) {
    throw createError({ statusCode: 400, message: 'Invalid enrollment ID.' })
  }

  const enrollment = await prisma.enrollment.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      },
      courseVariant: {
        include: {
          course: {
            select: { id: true, name: true }
          }
        }
      }
    }
  })

  if (!enrollment) {
    throw createError({ statusCode: 404, message: 'Enrollment not found.' })
  }

  return { enrollment }
})
