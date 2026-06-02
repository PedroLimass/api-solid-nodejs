import type { FastifyInstance } from 'fastify'
import { search } from './search.js'
import { nearby } from './nearby.js'
import { create } from './create.js'
import { verifyJwt } from '../../middlewares/verify-jwt.js'

export async function gymsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  app.get('/gyms/search', search)
  app.get('/gyms/nearby', nearby)
  app.post('/gyms', create)
}
