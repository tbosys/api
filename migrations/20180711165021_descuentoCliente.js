const v1 = require('../triggers/descuentoCliente/v1');



exports.up = function (knex, Promise) {
  return knex.schema.createTable('descuentoCliente', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.integer("descuento");

    table.string("clienteExternalId", 20);
    table.string("productoExternalId", 20);

    table.integer("clienteId").unsigned();
    table.foreign('clienteId').references('id').inTable('cliente').onDelete("RESTRICT");

    table.integer("productoId").unsigned();
    table.foreign('productoId').references('id').inTable('producto').onDelete("RESTRICT");



    table.unique(['clienteId', 'productoId', 'namespaceId'], "desccliente")
  }).then(function () {
    return Promise.mapSeries(v1.up, (sql) => knex.schema.raw(sql))
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('descuentoCliente');
};
