exports.up = function (knex, Promise) {
  return knex.schema.createTable('code', function (table) {
    table.increments();

    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.integer("code");

    table.integer("usuarioId").unsigned();
    table.foreign('usuarioId').references('id').inTable('usuario').onDelete("RESTRICT");

  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('code');
};