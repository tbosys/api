exports.up = function(knex, Promise) {
  return knex.schema.alterTable("cliente", function(table) {
    table.decimal("plazoPago", 10, 2);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("cliente", function(table) {
    table.dropColumn("plazoPago");
  });
};
