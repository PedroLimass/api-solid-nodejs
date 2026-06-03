import { beforeEach } from 'vitest'
import { prisma } from '@/lib/prisma.js'

beforeEach(async () => {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "check_ins", "gyms", "users" RESTART IDENTITY CASCADE',
  )
})
