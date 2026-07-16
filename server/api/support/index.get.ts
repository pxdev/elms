export default defineEventHandler(async (event) => {
  const { user } = await requireUserSession(event)
  const requests = await prisma.supportRequest.findMany({
    where: { userId: user.id },
    include: { enrollment: { select: { course: { select: { name: true } } } } },
    orderBy: { createdAt: 'desc' }
  })
  return { requests }
})
