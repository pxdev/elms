export default defineEventHandler(async (event) => {
  await requireRole(event, ['TEACHER', 'ADMIN'])
  const { user } = await requireUserSession(event)

  const query = getQuery(event)
  const from = query.from as string | undefined
  const to = query.to as string | undefined

  const where: any = { teacherId: user.id, isActive: true }
  if (from || to) {
    where.date = {}
    if (from) where.date.gte = from
    if (to) where.date.lte = to
  }

  const availability = await prisma.teacherAvailability.findMany({
    where,
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }]
  })

  return { availability }
})
