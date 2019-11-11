
exports.up = function (knex, Promise) {
  return knex.schema.createTable('comisionHistorico', function (table) {
    table.increments();
    table.string("fecha");
    table.string('tipo');
    table.decimal('monto', 17, 5);

    table.integer("movimientoInventarioId").unsigned();
    table.foreign('movimientoInventarioId').references('id').inTable('movimientoInventario').onDelete("RESTRICT");

    table.integer("vendedorId").unsigned();
    table.foreign('vendedorId').references('id').inTable('vendedor').onDelete("RESTRICT");

    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.integer("ownerId").unsigned();
    table.foreign('ownerId').references('id').inTable('usuario').onDelete("RESTRICT");
    table.string("ownerName");
  })

}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('comisionHistorico')

};