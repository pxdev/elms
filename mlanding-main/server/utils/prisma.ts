import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/client'

// Suppress harmless pg v8.19+ deprecation warning about concurrent queries.
const originalEmitWarning = process.emitWarning
process.emitWarning = function (warning: any, ...args: any[]) {
  if (typeof warning === 'string' && warning.includes('already executing a query')) {
    return
  }
  return originalEmitWarning.call(process, warning, ...args)
} as typeof process.emitWarning

const prismaClientSingleton = () => {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!
  })
  return new PrismaClient({ adapter })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
