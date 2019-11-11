exports.up = function (knex, Promise) {
  return knex.schema.createTable('saldo', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.string("consecutivo", 51);
    table.date("fecha");
    table.string("moneda", 3).defaultTo("CRC").notNull();

    table.decimal("tipoCambio", 15, 5).defaultTo(1);
    table.decimal("total", 18, 5);

    table.string("name");

    table.string("estado");
    table.integer("plazo");
    table.string("tipo", 10);

    table.string("documentoExternalId", 20);
    table.string("ownerExternalId", 20);
    table.string("clienteExternalId", 20);

    table.integer("clienteId").unsigned();
    table.foreign('clienteId').references('id').inTable('cliente').onDelete("RESTRICT");

    table.integer("documentoId").unsigned();
    table.foreign('documentoId').references('id').inTable('documento').onDelete("RESTRICT");

    table.integer("ownerId").unsigned();
    table.foreign('ownerId').references('id').inTable('usuario').onDelete("RESTRICT");

    table.string("ownerName");

    table.unique(['documentoId', 'namespaceId'])
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('saldo');
};
