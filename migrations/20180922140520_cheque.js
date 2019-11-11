
const Promise = require('bluebird');

exports.up = function (knex, Promise) {
  return knex.schema.createTable('cheque', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.string("estado");
    table.string("referencia", 51).notNull();
    table.string("banco", 35).notNull();
    table.date("fecha");
    table.date("fechaDeposito");
    table.string("moneda");
    table.decimal("monto", 18, 5);


    table.unique(['referencia', 'banco', 'namespaceId'], "fcxp")
  })
}

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('cheque');
}
