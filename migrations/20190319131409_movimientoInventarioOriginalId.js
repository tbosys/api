exports.up = function(knex, Promise) {
  return knex.schema.alterTable("movimientoInventario", function(table) {
    table.integer("movimientoInventarioOriginalId");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("movimientoInventario", function(table) {
    table.dropColumn("movimientoInventarioOriginalId");
  });
};
