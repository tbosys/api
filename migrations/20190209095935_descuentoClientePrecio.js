exports.up = function(knex, Promise) {
  return knex.schema.alterTable("descuentoCliente", function(table) {
    table.decimal("precio", 15, 5);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("descuentoCliente", function(table) {
    table.dropColumn("precio");
  });
};
