exports.up = function(knex, Promise) {
  return knex.schema.alterTable("clienteStats", function(table) {
    table.decimal("promedioCompraG5", 18, 5);
    table.integer("promedioCompraG5Delta", 18, 5);
    table.decimal("promedioCompraG5Potencial", 18, 5);
    table.decimal("coberturaCompraG5");
    table.decimal("totalCicloG5", 18, 5);
    table.decimal("totalCicloG4", 18, 5);
    table.decimal("totalCicloG3", 18, 5);
    table.decimal("totalCicloG2", 18, 5);
    table.decimal("totalCicloG1", 18, 5);
    table.decimal("totalCicloUnidadG5", 18, 5);
    table.decimal("totalCicloUnidadG4", 18, 5);
    table.decimal("totalCicloUnidadG3", 18, 5);
    table.decimal("totalCicloUnidadG2", 18, 5);
    table.decimal("totalCicloUnidadG1", 18, 5);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("clienteStats", function(table) {
    table.dropColumn("promedioCompraG5");
    table.dropColumn("promedioCompraG5Delta");
    table.dropColumn("promedioCompraG5Potencial");
    table.dropColumn("coberturaCompraG5");
    table.dropColumn("totalCicloG5");
    table.dropColumn("totalCicloG4");
    table.dropColumn("totalCicloG3");
    table.dropColumn("totalCicloG2");
    table.dropColumn("totalCicloG1");
    table.dropColumn("totalCicloUnidadG5");
    table.dropColumn("totalCicloUnidadG4");
    table.dropColumn("totalCicloUnidadG3");
    table.dropColumn("totalCicloUnidadG2");
    table.dropColumn("totalCicloUnidadG1");
  });
};
