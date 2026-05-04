export default defineEventHandler(async (event) => {
  const token = getRouterParam(event, 'token')
  if (!token) {
    return sendRedirect(event, '/verify-email?status=invalid')
  }

  try {
    const userId = await consumeToken(token, 'email_verify')
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true, emailVerifiedAt: new Date() }
    })
    return sendRedirect(event, '/verify-email?status=ok')
  } catch {
    return sendRedirect(event, '/verify-email?status=invalid')
  }
})
