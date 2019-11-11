exports.up = function(knex, Promise) {
  return knex.schema.alterTable("movimientoInventario", function(table) {
    table.string("impuestoCodigoTarifa");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("movimientoInventario", function(table) {
    table.dropColumn("impuestoCodigoTarifa");
  });
};
