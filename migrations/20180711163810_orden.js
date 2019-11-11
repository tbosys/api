exports.up = function (knex, Promise) {
  return knex.schema.createTable('orden', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.string("estado", 30);
    table.string("tipo", 8);
    table.string("emails");
    table.text("descripcion");
    table.string("name", 51);
    table.boolean("especial").defaultTo(false);
    table.string("cedula", 15);
    table.string("codigoExterno", 51);
    table.string("fuente", 50);
    table.string("moneda", 3);
    table.decimal("tipoCambio", 15, 5);
    table.integer("plazo");
    table.date("fechaAprobacion");
    table.decimal("subTotal", 18, 5);
    table.decimal("subTotalConDescuento", 18, 5);
    table.decimal("impuesto", 18, 5);
    table.decimal("descuento", 18, 5);
    table.decimal("total", 18, 5);
    table.string("approveBy");
    table.json("ordenLinea");
    table.date("fecha");
    table.string("fechaISO", 51);

    table.string("externalId", 20);
    table.string("ownerExternalId", 20);
    table.string("clienteExternalId", 20);
    table.string("documentoExternalId", 20);
    table.string("vendedorName");
    table.string("zonaName");

    table.integer("promocionId").unsigned();
    table.foreign('promocionId').references('id').inTable('promocion').onDelete("RESTRICT");

    table.integer("clienteId").unsigned();
    table.foreign('clienteId').references('id').inTable('cliente').onDelete("RESTRICT");

    table.integer("zonaId").unsigned();
    table.foreign('zonaId').references('id').inTable('zona').onDelete("RESTRICT");

    table.integer("transporteId").unsigned();
    table.foreign('transporteId').references('id').inTable('transporte').onDelete("RESTRICT");

    table.integer("ownerId").unsigned();
    table.foreign('ownerId').references('id').inTable('usuario').onDelete("RESTRICT");

    table.string("ownerName");

    table.unique(['name', 'clienteId', 'externalId', 'namespaceId'], "orden")
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('orden');
};