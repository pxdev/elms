import type { Role } from '../prisma/generated/client/client'

declare module '#auth-utils' {
  interface User {
    id: number
    email: string
    name: string | null
    avatarUrl?: string | null
    role: Role
    timeZone?: string | null
    phone?: string | null
    country?: string | null
    age?: number | null
    isActive?: boolean
  }

  interface UserSession {
    user: User
    loggedInAt: number
  }
}

export {}
