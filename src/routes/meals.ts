import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { randomUUID } from 'crypto'
import { z } from 'zod'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.addHook('preHandler', checkSessionIdExists)

  app.get('/', async (req) => {
    const meals = await knex('meals').where('user_id', req.user?.id)

    return { meals }
  })

  app.get('/:id', async (req) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(req.params)

    const meal = await knex('meals')
      .where('user_id', req.user?.id)
      .where('id', id)
      .first()

    return { meal }
  })

  app.post('/', async (req, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      isWithinDiet: z.boolean().default(true),
      ateAt: z.coerce.date(),
    })

    const { name, description, isWithinDiet, ateAt } =
      createMealBodySchema.parse(req.body)

    await knex('meals').insert({
      id: randomUUID(),
      name,
      description,
      is_within_diet: isWithinDiet,
      ate_at: ateAt.toISOString(),
      user_id: req.user?.id,
    })

    return reply.status(201).send()
  })

  app.put('/:id', async (req, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      isWithinDiet: z.boolean().default(true),
      ateAt: z.coerce.date(),
    })

    const { name, description, isWithinDiet, ateAt } =
      createMealBodySchema.parse(req.body)

    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(req.params)

    await knex('meals')
      .where({
        id,
        user_id: req.user?.id,
      })
      .update({
        name,
        description,
        is_within_diet: isWithinDiet,
        ate_at: ateAt.toISOString(),
      })

    return reply.status(204).send()
  })

  app.delete('/:id', async (req, reply) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(req.params)

    await knex('meals')
      .where({
        id,
        user_id: req.user?.id,
      })
      .delete()

    return reply.status(204).send()
  })
}
