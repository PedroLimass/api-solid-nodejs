import type { Gym, Prisma } from '@/lib/prisma.js'

export interface GymsRepository {
  findById(id: string): Promise<Gym | null>
  searchMany(query: string, page: number): Promise<Gym[]>
  create(data: Prisma.GymUpdateInput): Promise<Gym>
}
