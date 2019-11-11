exports.up = function (knex, Promise) {
  return knex.schema.createTable('listaEmpaque', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.string("paquetes");
    table.decimal("peso");
    table.decimal("volumen");
    table.string("preparadoPor");
    table.string("entregadoPor");
    table.string("approveBy");

    table.string("envioName");
    table.string("ownerExternalId", 20);
    table.string("documentoExternalId", 20);

    table.integer("documentoId").unsigned();
    table.foreign('documentoId').references('id').inTable('documento').onDelete("RESTRICT");

    table.integer("envioId").unsigned();
    table.foreign('envioId').references('id').inTable('envio').onDelete("RESTRICT");

    table.integer("ownerId").unsigned();
    table.foreign('ownerId').references('id').inTable('usuario').onDelete("RESTRICT");

    table.string("ownerName");

    table.unique(['envioId', 'documentoId', 'namespaceId'], "listempaq")
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('listaEmpaque');
};