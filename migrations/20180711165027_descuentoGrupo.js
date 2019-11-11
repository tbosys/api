const v1 = require('../triggers/descuentoGrupo/v1');

exports.up = function (knex, Promise) {
  return knex.schema.createTable('descuentoGrupo', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.integer("descuento");

    table.string("name");
    table.string("productoExternalId");
    table.string("grupoName");

    table.integer("grupoId").unsigned();
    table.foreign('grupoId').references('id').inTable('grupo').onDelete("RESTRICT");

    table.integer("productoId").unsigned();
    table.foreign('productoId').references('id').inTable('producto').onDelete("RESTRICT");

    table.unique(['grupoId', 'productoId', 'namespaceId'], "descgrupo")
  }).then(function () {
    return Promise.mapSeries(v1.up, (sql) => knex.schema.raw(sql))
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('descuentoGrupo');
};