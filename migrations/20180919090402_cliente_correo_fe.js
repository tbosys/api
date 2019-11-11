exports.up = function (knex, Promise) {
  return knex.schema.createTable('clienteCorreoFe', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.string("email").notNull();

    table.integer("clienteId").unsigned();
    table.foreign('clienteId').references('id').inTable('cliente').onDelete("RESTRICT");

    table.unique(['clienteId', 'email', 'namespaceId'])
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTableIfExists('clienteCorreoFe');
};
