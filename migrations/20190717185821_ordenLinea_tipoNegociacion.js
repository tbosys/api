exports.up = function(knex, Promise) {
  return knex.schema
    .alterTable("ordenLinea", function(table) {
      table.string("tipoNegociacion");
      table.decimal("tipoNegociacionMonto", 15, 3);
    })
    .then(() => {
      return knex.schema.alterTable("movimientoInventario", function(table) {
        table.string("tipoNegociacion");
        table.decimal("tipoNegociacionMonto", 15, 3);
      });
    })
    .then(() => {
      return knex.schema.alterTable("orden", function(table) {
        table.string("negociado");
      });
    });
};
//
exports.down = function(knex, Promise) {
  return knex.schema
    .alterTable("ordenLinea", function(table) {
      table.dropColumn("tipoNegociacion");
      table.dropColumn("tipoNegociacionMonto");
    })
    .then(() => {
      return knex.schema.alterTable("movimientoInventario", function(table) {
        table.dropColumn("tipoNegociacion");
        table.dropColumn("tipoNegociacionMonto");
      });
    })
    .then(() => {
      return knex.schema.alterTable("orden", function(table) {
        table.dropColumn("negociado");
      });
    });
};
