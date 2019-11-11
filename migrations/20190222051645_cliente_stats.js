exports.up = function(knex, Promise) {
  return knex.schema.alterTable("cliente", function(table) {
    table.integer("plazoMaximo");
    table.date("ultimoContacto");
    table.decimal("ultimaCompra", 15, 5);
    table.decimal("promedioCompra", 15, 5);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("cliente", function(table) {
    table.dropColumn("plazoMaximo");
    table.dropColumn("ultimoContacto");
    table.dropColumn("ultimaCompra");
    table.dropColumn("promedioCompra");
  });
};
