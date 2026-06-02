import type { FastifyInstance } from 'fastify'

import { verifyJwt } from '../../middlewares/verify-jwt.js'

import { create } from './create.js'
import { validate } from './validate.js'
import { history } from './history.js'
import { metrics } from './metrics.js'

export async function checkInsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  app.get('/check-ins/history', history)
  app.get('/check-ins/metrics', metrics)

  app.post('/gyms/:gymId/check-ins', create)
  app.patch('/check-ins/:checkInId/validate', validate)
}
