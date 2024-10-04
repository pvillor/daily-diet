import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.text('name').notNullable()
    table.timestamp('ate_at').notNullable()
    table.boolean('isWithinDiet').notNullable()
    table.uuid('user_id')

    table.foreign('user_id').references('id').inTable('users')
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('meals', (table) => {
    table.dropForeign('user_id')
  })
  await knex.schema.dropTable('meals')
}

