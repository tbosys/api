exports.up = function (knex, Promise) {
  return knex.schema.createTable('pagoDocumento', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.string("estado", 30);
    table.integer("recibo");
    table.boolean("contado");
    table.string("referencia", 100).notNull();
    table.string("moneda", 3);
    table.string("formaPago");
    table.decimal("tipoCambio").defaultTo(0);
    table.decimal("monto", 18, 5);
    table.decimal("montoPendiente", 18, 5);
    table.integer("approveBy");
    table.date("fecha");
    table.string("fechaISO", 51);
    table.json("lineaPagoDocumento");

    table.string("externalId", 20);
    table.string("ownerExternalId", 20);
    table.string("clienteExternalId", 20);
    table.string("vendedorName");

    table.integer("ownerId").unsigned();
    table.foreign('ownerId').references('id').inTable('usuario').onDelete("RESTRICT");

    table.integer("clienteId").unsigned();
    table.foreign('clienteId').references('id').inTable('cliente').onDelete("RESTRICT");


    table.string("ownerName");

    table.unique(['recibo', 'externalId', 'referencia', 'namespaceId'], "pagodoc")


  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('pagoDocumento');
};