export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const requests = await prisma.supportRequest.findMany({
    include: {
      user: { select: { name: true, email: true } },
      enrollment: { select: { course: { select: { name: true } }, lsOrderId: true, paymentStatus: true } }
    },
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }]
  })
  return { requests }
})
