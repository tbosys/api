exports.up = function (knex, Promise) {
  return knex.schema.createTable('ajusteCierre', function (table) {
    table.increments();
    table.string("namespaceId", 20);
    table.string("createdBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.date("fecha");


    table.string("tipo");
    table.decimal("monto", 18, 5);
    table.string("descripcion")
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('ajusteCierre');
};

