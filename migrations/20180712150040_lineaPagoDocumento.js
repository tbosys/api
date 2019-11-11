exports.up = function (knex, Promise) {
  return knex.schema.createTable('lineaPagoDocumento', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.decimal("monto", 18, 5);
    table.decimal("tipoCambio", 18, 5).defaultTo(1);
    table.integer("recibo");
    table.string("moneda").defaultTo("CRC");
    table.decimal("montoPendiente", 18, 5);
    table.string("consecutivo", 51);
    table.date("fecha");
    table.string("plazoDocumento");
    table.string("tipoDocumento");
    table.string("externalId", 20);
    table.string("documentoExternalId", 20);
    table.string("ownerExternalId", 20);

    table.integer("pagoDocumentoId").unsigned().notNull();
    table.foreign('pagoDocumentoId').references('id').inTable('pagoDocumento').onDelete("RESTRICT");

    table.integer("documentoId").unsigned();
    table.foreign('documentoId').references('id').inTable('documento').onDelete("RESTRICT");

    table.integer("ownerId").unsigned();
    table.foreign('ownerId').references('id').inTable('usuario').onDelete("RESTRICT");

    table.string("ownerName");

    table.unique(['pagoDocumentoId', 'documentoId','externalId'], "linpagodoc")


  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('lineaPagoDocumento');
};