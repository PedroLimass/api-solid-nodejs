import { PrismaCheckInsRepository } from '@/repositories/prisma/prisma-check-ins-repository.js'
import { PrismaGymsRepository } from '@/repositories/prisma/prisma-gyms-repository.js'
import { CheckInUseCase } from '../check-in.js'

export function makeCheckInUseCase() {
  const checkInsRepository = new PrismaCheckInsRepository()
  const gymsRepository = new PrismaGymsRepository()

  const useCase = new CheckInUseCase(checkInsRepository, gymsRepository)

  return useCase
}
