exports.up = function(knex, Promise) {
    return knex.schema.alterTable("clienteStats", function(table) {
      table.decimal("promedioCompraG4", 18, 5);
      table.integer("promedioCompraG4Delta", 18, 5);
      table.decimal("promedioCompraG4Potencial", 18, 5);
    });
  };
  
  exports.down = function(knex, Promise) {
    return knex.schema.alterTable("clienteStats", function(table) {
        table.dropColumn("promedioCompraG4");
        table.dropColumn("promedioCompraG4Delta");
        table.dropColumn("promedioCompraG4Potencial");
      });
  };
  