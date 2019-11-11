exports.up = function(knex, Promise) {
  return knex.schema.alterTable("clienteStats", function(table) {
    table.date("ultimaCompra");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("clienteStats", function(table) {
    table.dropColumn("ultimaCompra");
  });
};
