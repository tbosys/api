const v1 = require('../triggers/descuentoPromocion/v1');


exports.up = function (knex, Promise) {
  return knex.schema.createTable('descuentoPromocion', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.integer("descuento");

    table.integer("promocionId").unsigned();
    table.foreign('promocionId').references('id').inTable('promocion').onDelete("RESTRICT");

    table.integer("productoId").unsigned();
    table.foreign('productoId').references('id').inTable('producto').onDelete("RESTRICT");

    table.unique(['promocionId', 'productoId', 'namespaceId'], "descpromo")
  }).then(function () {
    return Promise.mapSeries(v1.up, (sql) => knex.schema.raw(sql))
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('descuentoPromocion');
};