import type { FastifyInstance } from 'fastify'
import { search } from './search.js'
import { nearby } from './nearby.js'
import { create } from './create.js'
import { verifyJwt } from '../../middlewares/verify-jwt.js'

const gymSchema = {
  type: 'object',
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string', nullable: true },
    phone: { type: 'string', nullable: true },
    latitude: { type: 'number' },
    longitude: { type: 'number' },
  },
}

export async function gymsRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJwt)

  app.get(
    '/gyms/search',
    {
      schema: {
        tags: ['Gyms'],
        summary: 'Buscar academias pelo nome',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          required: ['q'],
          properties: {
            q: { type: 'string' },
            page: { type: 'integer', minimum: 1, default: 1 },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: { gyms: { type: 'array', items: gymSchema } },
          },
        },
      },
    },
    search,
  )

  app.get(
    '/gyms/nearby',
    {
      schema: {
        tags: ['Gyms'],
        summary: 'Listar academias próximas (até 10km)',
        security: [{ bearerAuth: [] }],
        querystring: {
          type: 'object',
          required: ['latitude', 'longitude'],
          properties: {
            latitude: { type: 'number' },
            longitude: { type: 'number' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: { gyms: { type: 'array', items: gymSchema } },
          },
        },
      },
    },
    nearby,
  )

  app.post(
    '/gyms',
    {
      schema: {
        tags: ['Gyms'],
        summary: 'Cadastrar uma nova academia',
        security: [{ bearerAuth: [] }],
        body: {
          type: 'object',
          required: ['title', 'latitude', 'longitude'],
          properties: {
            title: { type: 'string' },
            description: { type: 'string', nullable: true },
            phone: { type: 'string', nullable: true },
            latitude: { type: 'number', minimum: -90, maximum: 90 },
            longitude: { type: 'number', minimum: -180, maximum: 180 },
          },
        },
        response: {
          201: { type: 'null', description: 'Academia criada' },
        },
      },
    },
    create,
  )
}
