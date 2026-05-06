export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const teachers = await prisma.user.findMany({
    where: { role: 'TEACHER' },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' }
  })

  return { teachers }
})
