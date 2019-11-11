
const Promise = require('bluebird');

exports.up = function (knex, Promise) {
  return knex.schema.createTable('gasto', function (table) {
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
    table.date("fecha");
    table.string("moneda");
    table.decimal("tipoCambio", 12, 5);
    table.decimal("subTotal", 18, 5);
    table.decimal("impuesto", 14, 5);
    table.decimal("descuento", 14, 5);
    table.decimal("total", 18, 5);
    table.decimal("saldo", 18, 5);

    table.string("asignacion");
    table.boolean("registrarImpuesto");

    table.integer("proveedorId").unsigned();
    table.foreign('proveedorId').references('id').inTable('proveedor').onDelete("RESTRICT");

    table.unique(['referencia', 'tipo', 'proveedorId', 'namespaceId'], "fcxp")
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('gasto');
}
