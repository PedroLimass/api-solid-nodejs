import type { FastifyInstance } from 'fastify'

import { authenticate } from './authenticate.js'
import { profile } from './profile.js'
import { register } from './register.js'
import { verifyJwt } from '@/http/middlewares/verify-jwt.js'
import { refresh } from './refresh.js'

export async function usersRoutes(app: FastifyInstance) {
  app.post(
    '/users',
    {
      schema: {
        tags: ['Users'],
        summary: 'Cadastrar um novo usuário',
        body: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
          },
        },
        response: {
          201: { type: 'null', description: 'Usuário criado' },
          409: {
            type: 'object',
            description: 'E-mail já cadastrado',
            properties: { message: { type: 'string' } },
          },
        },
      },
    },
    register,
  )

  app.post(
    '/sessions',
    {
      schema: {
        tags: ['Users'],
        summary: 'Autenticar usuário (login)',
        body: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
          },
        },
        response: {
          200: {
            type: 'object',
            description: 'Access token (refresh token vai no cookie)',
            properties: { token: { type: 'string' } },
          },
          400: {
            type: 'object',
            description: 'Credenciais inválidas',
            properties: { message: { type: 'string' } },
          },
        },
      },
    },
    authenticate,
  )

  app.patch(
    '/token/refresh',
    {
      schema: {
        tags: ['Users'],
        summary: 'Renovar o access token a partir do cookie refreshToken',
        response: {
          200: {
            type: 'object',
            properties: { token: { type: 'string' } },
          },
        },
      },
    },
    refresh,
  )

  app.get(
    '/me',
    {
      onRequest: [verifyJwt],
      schema: {
        tags: ['Users'],
        summary: 'Obter o perfil do usuário autenticado',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  role: { type: 'string', enum: ['ADMIN', 'MEMBER'] },
                  created_at: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
    },
    profile,
  )
}
