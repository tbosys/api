exports.up = function(knex, Promise) {
  return knex.schema.alterTable("cliente", function(table) {
    table.decimal("metaCompra");
    table.integer("metaPlazoPago");
    table.integer("indiceCompraG1");
    table.integer("indiceCompraG2");
    table.integer("indiceCompraG3");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("cliente", function(table) {
    table.dropColumn("metaCompra");
    table.dropColumn("metaPlazoPago");
    table.dropColumn("indiceCompraG1");
    table.dropColumn("indiceCompraG2");
    table.dropColumn("indiceCompraG3");
  });
};
