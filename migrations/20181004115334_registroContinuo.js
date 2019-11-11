exports.up = function (knex, Promise) {
  return knex.schema.createTable('registroContinuo', function (table) {
    table.increments();
    table.string("namespaceId", 20);
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.string("tipo");
    table.date("fecha");
    table.decimal("monto", 18, 5);
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('registroContinuo');
};