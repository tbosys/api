exports.up = function(knex, Promise) {
  return knex.schema.alterTable("clienteStats", function(table) {
    table.decimal("coberturaCompra");
    table.decimal("coberturaCompraG1");
    table.decimal("coberturaCompraG2");
    table.decimal("coberturaCompraG3");
    table.decimal("coberturaCompraG4");
    table.decimal("coberturaCompraGs");
    table.decimal("coberturaCreditoMonto");
    table.decimal("coberturaCreditoDias");
    table.decimal("nivelG1");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("clienteStats", function(table) {
    table.dropColumn("coberturaCompra");
    table.dropColumn("coberturaCompraG1");
    table.dropColumn("coberturaCompraG2");
    table.dropColumn("coberturaCompraG3");
    table.dropColumn("coberturaCompraG4");
    table.dropColumn("coberturaCompraGs");
    table.dropColumn("coberturaCreditoMonto");
    table.dropColumn("coberturaCreditoDias");
    table.dropColumn("nivelG1");
  });
};
