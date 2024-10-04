import 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      username: string
      created_at: string
      sesion_id?: string
    }
    meals: {
      id: string
      name: string
      ate_at: string
      isWithinDiet: boolean
      user_id: string
    }
  }
}
