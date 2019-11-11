exports.up = function (knex, Promise) {
  return knex.schema.createTable('ordenLinea', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.decimal("cantidad", 18, 5);
    table.decimal("precio", 18, 5);
    table.decimal("subTotal", 18, 5);
    table.decimal("impuesto", 18, 5);
    table.decimal("descuento", 18, 5);
    table.decimal("subTotalConDescuento", 18, 5);
    table.decimal("impuestoUnitario", 13, 5);
    table.decimal("descuentoUnitario", 13, 5);
    table.string("medida").notNull();
    table.boolean("mercancia").defaultTo(true);
    table.integer("numeroLinea");
    table.decimal("total", 18, 5);
    table.string("codigo").notNull();
    table.string("detalle").notNull();
    table.string("naturalezaDescuento");

    table.string("externalId", 20);
    table.string("ownerExternalId", 20);
    table.string("productoExternalId", 20);
    table.string("ordenCodigoExterno", 51);

    table.integer("ordenId").unsigned();
    table.foreign('ordenId').references('id').inTable('orden').onDelete("RESTRICT");

    table.integer("productoId").unsigned();
    table.foreign('productoId').references('id').inTable('producto').onDelete("RESTRICT");

    table.integer("ownerId").unsigned();
    table.foreign('ownerId').references('id').inTable('usuario').onDelete("RESTRICT");

    table.string("ownerName");

    table.unique(['ordenId', 'productoId', 'namespaceId'], "ordenLinea")
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('ordenLinea');
};