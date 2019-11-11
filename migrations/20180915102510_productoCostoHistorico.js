const v1 = require('../triggers/producto/v1');

exports.up = function (knex, Promise) {
  return knex.schema.alterTable('producto', function (table) {
    table.integer("costoHistoricoId").unsigned();
    table.foreign('costoHistoricoId').references('id').inTable('costoHistorico').onDelete("RESTRICT");

  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('producto', function (table) {
    table.dropForeign('costoHistoricoId');
    table.dropColumn("costoHistoricoId");
  })
}