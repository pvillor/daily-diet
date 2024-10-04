import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'crypto'
import dayjs from 'dayjs'

export async function usersRoutes(app: FastifyInstance) {
  app.get('/:id/metrics', async (req, reply) => {
    const getUserParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getUserParamsSchema.parse(req.params)

    const userMeals = await knex('meals').where('user_id', id)

    const metrics = userMeals.reduce(
      (acc, userMeal, index) => {
        if (userMeal.isWithinDiet === true) {
          acc.mealsWithinDietAmount++
          if (
            dayjs(userMeals[index].ate_at).diff(
              userMeals[index - 1].ate_at,
              'days',
            ) === 1
          ) {
            acc.bestStreakWithinDiet++
          }
        }
        if (userMeal.isWithinDiet === false) {
          acc.mealsWithinDietAmount++
        }

        return acc
      },
      {
        mealsWithinDietAmount: 0,
        mealsOutsideDietAmount: 0,
        bestStreakWithinDiet: 0,
      },
    )

    return {
      totalMeals: userMeals.length,
      mealsWithinDietAmount: metrics.mealsWithinDietAmount,
      mealsOutsideDietAmount: metrics.mealsOutsideDietAmount,
      bestStreakWithinDiet: metrics.bestStreakWithinDiet,
    }
  })

  app.post('/', async (req, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      username: z.string(),
    })

    const { name, username } = createUserBodySchema.parse(req.body)

    await knex('users').insert({
      id: randomUUID(),
      name,
      username,
    })

    return reply.status(201).send()
  })
}
