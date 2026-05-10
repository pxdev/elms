import { courseMaterialSchema } from '~~/shared/schemas'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const courseId = Number(getRouterParam(event, 'id'))
  if (!courseId) {
    throw createError({ statusCode: 400, message: 'Invalid course ID.' })
  }

  const body = await parseBody(event, courseMaterialSchema)

  const material = await prisma.courseMaterial.create({
    data: {
      courseId,
      title: body.title.trim(),
      type: body.type,
      url: body.url?.trim() ?? null,
      isPrivate: body.isPrivate ?? false,
      enrollmentId: body.enrollmentId ?? null
    }
  })

  return { material }
})
