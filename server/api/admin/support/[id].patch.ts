import { z } from 'zod'

export default defineEventHandler(async (event) => {
  await requireRole(event, ['ADMIN'])
  const id = Number(getRouterParam(event, 'id'))
  const body = await parseBody(event, z.object({ status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED']) }))
  const request = await prisma.supportRequest.update({ where: { id }, data: { status: body.status } })
  return { request }
})
