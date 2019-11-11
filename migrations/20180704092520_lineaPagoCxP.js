exports.up = function (knex, Promise) {
  return knex.schema.createTable('lineaPagoCxP', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.string("referencia");

    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.decimal("tipoCambio", 12, 5);
    table.decimal("monto", 18, 5);
    table.decimal("montoPendiente", 18, 5);
    table.date("fecha");
    table.integer("pagoCxPId").unsigned();
    table.foreign('pagoCxPId').references('id').inTable('pagoCxP').onDelete("RESTRICT");

    table.integer("facturaCxPId").unsigned();
    table.foreign('facturaCxPId').references('id').inTable('facturaCxP').onDelete("RESTRICT");

    table.integer("ownerId").unsigned();
    table.foreign('ownerId').references('id').inTable('usuario').onDelete("RESTRICT");

    table.string("ownerName");

    table.unique(['pagoCxPId', 'facturaCxPId', 'namespaceId'], "lineapago")


  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('lineaPagoCxP');
};
