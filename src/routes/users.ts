import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { z } from 'zod'
import { randomUUID } from 'crypto'

export async function usersRoutes(app: FastifyInstance) {
  app.get('/:id/metrics', async (req) => {
    const getUserParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getUserParamsSchema.parse(req.params)

    const userMeals = await knex('meals').where('user_id', id)
    const metrics = userMeals.reduce(
      (acc, userMeal) => {
        if (!!userMeal.is_within_diet === true) {
          acc.mealsWithinDietAmount++
          acc.streakCount++

          if (acc.streakCount > acc.bestStreakWithinDiet) {
            acc.bestStreakWithinDiet = acc.streakCount
          }
        }
        if (!!userMeal.is_within_diet === false) {
          acc.mealsOutsideDietAmount++
          acc.streakCount = 0
        }

        return acc
      },
      {
        mealsWithinDietAmount: 0,
        mealsOutsideDietAmount: 0,
        streakCount: 0,
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

    let sessionId = req.cookies.sessionId

    if (!sessionId) {
      sessionId = randomUUID()

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    await knex('users').insert({
      id: randomUUID(),
      name,
      username,
      session_id: sessionId,
    })

    return reply.status(201).send()
  })

  app.get('/', async () => {
    const users = await knex('users')

    return { users }
  })
}
