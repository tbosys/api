exports.up = function (knex, Promise) {
  return knex.schema.createTable('costoHistorico', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.boolean("activo");
    table.decimal("costo", 18, 5).notNull();
    table.decimal("costoAnterior", 18, 5).notNull();
    table.decimal("costoIngresado", 18, 5).notNull();

    table.string("productoExternalId");

    table.integer("productoId").unsigned();
    table.foreign('productoId').references('id').inTable('producto').onDelete("RESTRICT");

  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('costoHistorico');
};