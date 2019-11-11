exports.up = function (knex, Promise) {
  return knex.schema.createTable('registroGeneral', function (table) {
    table.increments();
    table.string("namespaceId", 20);
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.string("tipo");
    table.string("monto");
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('registroGeneral');
};

