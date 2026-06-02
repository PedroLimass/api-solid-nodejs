import type { FastifyInstance } from 'fastify'

import { authenticate } from './authenticate.js'
import { profile } from './profile.js'
import { register } from './register.js'
import { verifyJwt } from '@/http/middlewares/verify-jwt.js'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/users', register)
  app.post('/sessions', authenticate)

  /** Authenticated */
  app.get('/me', { onRequest: [verifyJwt] }, profile)
}
