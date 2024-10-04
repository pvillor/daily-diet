import 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      username: string
      created_at: string
      session_id?: string
    }
    meals: {
      id: string
      name: string
      description: string
      ate_at: string
      is_within_diet: boolean
      user_id: string
    }
  }
}
