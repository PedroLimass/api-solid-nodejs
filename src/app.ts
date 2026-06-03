import fastifyCookie from '@fastify/cookie'
import fastifyJwt from '@fastify/jwt'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastify from 'fastify'
import { ZodError } from 'zod'
import { env } from '@/env/index.js'
import { usersRoutes } from '@/http/controllers/users/routes.js'
import { gymsRoutes } from '@/http/controllers/gyms/routes.js'
import { checkInsRoutes } from './http/controllers/check-ins/routes.js'

export const app = fastify()

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'API SOLID — GymPass Style App',
      description:
        'API REST estilo GymPass: cadastro/autenticação de usuários, academias e check-ins.',
      version: '1.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    tags: [
      { name: 'Users', description: 'Cadastro, sessão e perfil de usuários' },
      { name: 'Gyms', description: 'Cadastro e busca de academias' },
      { name: 'Check-ins', description: 'Check-ins, histórico e métricas' },
    ],
  },
})

app.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

app.register(fastifyCookie)

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,
  cookie: {
    cookieName: 'refreshToken',
    signed: false,
  },
  sign: {
    expiresIn: '7d',
  },
})

app.register(usersRoutes)
app.register(gymsRoutes)
app.register(checkInsRoutes)

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply
      .status(400)
      .send({ message: 'Validation error.', issues: error.format() })
  }

  if (env.NODE_ENV !== 'production') {
    console.error(error)
  } else {
    // TODO: Here we should log to a external tool like DataDog/NewRelic/Sentry
  }

  return reply.status(500).send({ message: 'Internal server error.' })
})
