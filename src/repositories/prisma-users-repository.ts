import { prisma } from '@/lib/prisma.js'
import { Prisma } from '@/lib/prisma-types.js'

export class PrismaUsersRepository {
  async create(data: Prisma.UserCreateInput) {
    const user = await prisma.user.create({
      data,
    })

    return user
  }
}
