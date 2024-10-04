import 'fastify'

declare module 'fastify' {
  export interface FastifyRequest {
    user?: {
      id: string
      name: string
      username: string
      created_at: string
      session_id?: string
    }
  }
}
