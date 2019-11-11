exports.up = function(knex, Promise) {
  return knex.schema.alterTable("producto", function(table) {
    table.string("impuestoCodigoTarifa");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("producto", function(table) {
    table.dropColumn("impuestoCodigoTarifa");
  });
};
