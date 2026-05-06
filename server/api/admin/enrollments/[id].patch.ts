import { updateEnrollmentSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const id = Number(getRouterParam(event, 'id'))
  if (!id) {
    throw createError({ statusCode: 400, message: 'Invalid enrollment ID.' })
  }

  const body = await parseBody(event, updateEnrollmentSchema)

  const enrollment = await prisma.enrollment.update({
    where: { id },
    data: { status: body.status }
  })

  return { enrollment }
})
