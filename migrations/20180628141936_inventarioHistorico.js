exports.up = function (knex, Promise) {
  return knex.schema.createTable('inventarioHistorico', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.decimal("inventario", 18, 5).notNull();
    table.timestamp("fechaTiempo").defaultTo(knex.fn.now());
    table.integer("productoId").unsigned();
    table.foreign('productoId').references('id').inTable('producto').onDelete("RESTRICT");

  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('inventarioHistorico');
};