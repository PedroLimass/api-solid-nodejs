import { PrismaCheckInsRepository } from '@/repositories/prisma/prisma-check-ins-repository.js'
import { GetUserMetricsUseCase } from '../get-user-metrics.js'

export function makeGetUserMetricsUseCase() {
  const checkInsRepository = new PrismaCheckInsRepository()
  const useCase = new GetUserMetricsUseCase(checkInsRepository)

  return useCase
}
