exports.up = function (knex, Promise) {
  return knex.schema.createTable('despacho', function (table) {
    table.increments();
    table.date("fechaAlisto");
    table.date("fechaEntrega");
    table.string("estado");
    table.string("facturaUrl");

    table.text("descripcion");

    table.text("resumen");
    table.integer("clienteId").unsigned();
    table.foreign('clienteId').references('id').inTable('cliente').onDelete("RESTRICT");

    table.integer("transporteId").unsigned();
    table.foreign('transporteId').references('id').inTable('transporte').onDelete("RESTRICT");

    table.integer("documentoId").unsigned();
    table.foreign('documentoId').references('id').inTable('documento').onDelete("RESTRICT");

    table.integer("ownerId").unsigned();
    table.foreign('ownerId').references('id').inTable('usuario').onDelete("RESTRICT");

    table.string("ownerName");
    table.string("vendedorName");

    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();

  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('despacho');
};
