exports.up = (knex) =>
  knex.schema.createTable('movie_tags', table => {
    table.increments('id').primary();
    table.text('name').notNullable();
    table
      .integer('movie_notes_id')
      .references('id')
      .inTable('movie_notes')
      .onDelete('CASCADE')
      .notNullable();
    table.integer('user_id').references('id').inTable('users')
      .notNullable()
  });

exports.down = (knex) => knex.schema.dropTable('movie_tags');
