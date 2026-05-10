export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])

  const codes = await prisma.promoCode.findMany({
    include: {
      course: { select: { id: true, name: true } },
      _count: { select: { enrollments: true } }
    },
    orderBy: { createdAt: 'desc' }
  })

  return {
    codes: codes.map(c => ({
      ...c,
      orderCount: c._count.enrollments
    }))
  }
})
