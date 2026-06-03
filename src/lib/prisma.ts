import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client.js'
import { env } from '@/env/index.js'

export { Prisma, Role } from '../../generated/prisma/client.js'
export { Decimal } from '@prisma/client/runtime/client'
export type { User, CheckIn, Gym } from '../../generated/prisma/client.js'
export type { UserUncheckedCreateInput } from '../../generated/prisma/models/User.js'

const adapter = new PrismaPg({ connectionString: env.DATABASE_URL })

export const prisma = new PrismaClient({
  adapter,
  log: env.NODE_ENV === 'dev' ? ['query'] : [],
})
