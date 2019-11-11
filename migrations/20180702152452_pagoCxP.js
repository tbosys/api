exports.up = function (knex, Promise) {
  return knex.schema.createTable('pagoCxP', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.string("referencia", 51).notNull();
    table.string("moneda");
    table.string("formaPago");
    table.decimal("tipoCambio", 18, 5).defaultTo(0);
    table.decimal("monto", 18, 5);
    table.decimal("montoPendiente", 18, 5);
    table.integer("approveBy");
    table.json("lineaPagoCxP");
    table.integer("proveedorId").unsigned();
    table.foreign('proveedorId').references('id').inTable('proveedor').onDelete("RESTRICT");

    table.string("proveedorExternalId");

    table.integer("facturaCxPId").unsigned();
    table.foreign('facturaCxPId').references('id').inTable('facturaCxP').onDelete("RESTRICT");


    table.string("facturaCxPExternalId");
    table.string("ownerExternalId");

    table.integer("ownerId").unsigned();
    table.foreign('ownerId').references('id').inTable('usuario').onDelete("RESTRICT");

    table.string("ownerName");

    table.unique(['referencia', 'facturaCxPExternalId', 'namespaceId'], "pagocp")

  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('pagoCxP');
};
