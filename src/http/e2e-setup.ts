import { beforeAll } from 'vitest'
import { prisma } from '@/lib/prisma.js'

beforeAll(async () => {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "check_ins", "gyms", "users" RESTART IDENTITY CASCADE',
  )
})
