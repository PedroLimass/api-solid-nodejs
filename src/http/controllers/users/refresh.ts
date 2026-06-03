import type { FastifyReply, FastifyRequest } from 'fastify'
import { env } from '@/env/index.js'

export async function refresh(request: FastifyRequest, reply: FastifyReply) {
  await request.jwtVerify({ onlyCookie: true })

  const { role } = request.user

  const token = await reply.jwtSign(
    { role },
    {
      sign: {
        sub: request.user.sub,
      },
    },
  )

  const refreshToken = await reply.jwtSign(
    { role },
    {
      sign: {
        sub: request.user.sub,
        expiresIn: '7d',
      },
    },
  )

  return reply
    .setCookie('refreshToken', refreshToken, {
      path: '/',
      secure: env.NODE_ENV === 'production',
      sameSite: true,
      httpOnly: true,
    })
    .status(200)
    .send({
      token,
    })
}
