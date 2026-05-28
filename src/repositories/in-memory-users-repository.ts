import { Prisma } from '@/lib/prisma-types.js'

export class InMemoryUsersRepository {
  public users: any = []

  async create(data: Prisma.UserCreateInput) {
    this.users.push(data)
  }
}
