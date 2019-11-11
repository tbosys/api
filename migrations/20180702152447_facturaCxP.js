const v1 = require('../triggers/facturaCxP/v1');

const Promise = require('bluebird');

exports.up = function (knex, Promise) {
  return knex.schema.createTable('facturaCxP', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.string("estado");
    table.string("referencia", 51).notNull();
    table.string("tipo", 10);
    table.text("descripcion");
    table.integer("plazoActual");
    table.date("fechaFactura");
    table.date("fechaProgramacion");
    table.date("fechaVencimiento");
    table.string("moneda");
    table.decimal("tipoCambio", 12, 5);
    table.decimal("subTotal", 18, 5);
    table.decimal("impuesto", 14, 5);
    table.decimal("descuento", 14, 5);
    table.decimal("total", 18, 5);
    table.decimal("saldo", 18, 5);

    table.string("externalId");
    table.string("proveedorExternalId");
    table.string("ownerExternalId");

    table.integer("proveedorId").unsigned();
    table.foreign('proveedorId').references('id').inTable('proveedor').onDelete("RESTRICT");

    table.integer("ownerId").unsigned();
    table.foreign('ownerId').references('id').inTable('usuario').onDelete("RESTRICT");

    table.string("ownerName");

    table.unique(['referencia','externalId', 'proveedorId', 'namespaceId'], "fcxp")
  }).then(function () {
    return Promise.mapSeries(v1.up, (sql) => knex.schema.raw(sql))
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('facturaCxP')
    .then(function () {
      return Promise.mapSeries(v1.down, (sql) => knex.schema.raw(sql))
    })

};
