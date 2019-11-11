exports.up = function (knex, Promise) {
  return knex.schema.createTable('movimientoInventario', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.string("tipo");
    table.date("fecha");
    table.string("fechaISO");
    table.string("descripcion");
    table.decimal("cantidad", 15, 5);
    table.decimal("precio", 15, 5);
    table.string("referencia");
    table.decimal("subTotal", 18, 5);
    table.decimal("subTotalConDescuento", 18, 5);
    table.decimal("impuesto", 18, 5);
    table.decimal("descuento", 18, 5);
    table.decimal("impuestoUnitario", 8, 2);
    table.decimal("descuentoUnitario", 8, 2);
    table.decimal("total", 18, 5);
    table.decimal("costo", 18, 5).defaultTo(0);

    table.string("externalId", 20);
    table.string("documentoExternalId", 20);
    table.string("ownerExternalId", 20);
    table.string("productoExternalId", 20);
    table.string("clienteExternalId", 20);

    table.string("name");

    table.integer("numeroLinea");
    table.json("codigo");
    table.string("medida");
    table.string("detalle");
    table.string("naturalezaDescuento");
    table.boolean("mercancia").defaultTo(true);

    table.integer("costoHistoricoId").unsigned();
    table.foreign('costoHistoricoId').references('id').inTable('costoHistorico').onDelete("RESTRICT");

    table.integer("documentoId").unsigned();
    table.foreign('documentoId').references('id').inTable('documento').onDelete("RESTRICT");

    table.integer("boletaId").unsigned();
    table.foreign('boletaId').references('id').inTable('boleta').onDelete("RESTRICT");

    table.integer("productoId").unsigned();
    table.foreign('productoId').references('id').inTable('producto').onDelete("RESTRICT");

    table.integer("clienteId").unsigned();
    table.foreign('clienteId').references('id').inTable('cliente').onDelete("RESTRICT");

    table.integer("ownerId").unsigned();
    table.foreign('ownerId').references('id').inTable('usuario').onDelete("RESTRICT");

    table.string("ownerName");

    table.unique(['documentoId', 'productoId','externalId', 'namespaceId'], "movinvent")
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('movimientoInventario');
};