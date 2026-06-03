import type { FastifyInstance } from 'fastify'

import { verifyJwt } from '../../middlewares/verify-jwt.js'

import { create } from './create.js'
import { validate } from './validate.js'
import { history } from './history.js'
import { metrics } from './metrics.js'
import { verifyUserRole } from '@/http/middlewares/verify-user-role.js'

const checkInSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    created_at: { type: 'string', format: 'date-time' },
    validated_at: { type: 'string', format: 'date-time', nullable: true },
    user_id: { type: 'string' },
    gym_id: { type: 'string' },
  },
}

export async function checkInsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  app.get(
    '/check-ins/history',
    {
      schema: {
        tags: ['Check-ins'],
        summary: 'Histórico paginado de check-ins do usuário',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          properties: {
            page: { type: 'integer', minimum: 1, default: 1 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              checkIns: { type: 'array', items: checkInSchema },
            },
          },
        },
      },
    },
    history,
  )

  app.get(
    '/check-ins/metrics',
    {
      schema: {
        tags: ['Check-ins'],
        summary: 'Total de check-ins do usuário',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: { checkInsCount: { type: 'integer' } },
          },
        },
      },
    },
    metrics,
  )

  app.post(
    '/gyms/:gymId/check-ins',
    {
      schema: {
        tags: ['Check-ins'],
        summary: 'Realizar check-in em uma academia',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['gymId'],
          properties: { gymId: { type: 'string', format: 'uuid' } },
        },
        body: {
          type: 'object',
          required: ['latitude', 'longitude'],
          properties: {
            latitude: { type: 'number', minimum: -90, maximum: 90 },
            longitude: { type: 'number', minimum: -180, maximum: 180 },
          },
        },
        response: {
          201: { type: 'null', description: 'Check-in criado' },
        },
      },
    },
    create,
  )

  app.patch(
    '/check-ins/:checkInId/validate',
    {
      onRequest: [verifyUserRole('ADMIN')],
      schema: {
        tags: ['Check-ins'],
        summary: 'Validar um check-in (apenas ADMIN)',
        security: [{ bearerAuth: [] }],
        params: {
          type: 'object',
          required: ['checkInId'],
          properties: { checkInId: { type: 'string', format: 'uuid' } },
        },
        response: {
          204: { type: 'null', description: 'Check-in validado' },
        },
      },
    },
    validate,
  )
}
