exports.up = function (knex, Promise) {
  return knex.schema.createTable('log', function (table) {
    table.increments();
    table.string("namespaceId", 20).notNull();

    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.string("route");
    table.string("usuarioNombre");
    table.json("evento");
    table.json("error");
    table.integer("usuarioId").unsigned();
    table.foreign('usuarioId').references('id').inTable('usuario').onDelete("RESTRICT");

  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('log');
};
