exports.up = function(knex, Promise) {
  return knex.schema.alterTable("documento", function(table) {
    table.string("codigoActividad");
    table.decimal("totalServExonerado", 18, 5);
    table.decimal("totalMercExonerada", 18, 5);
    table.decimal("totalExonerado", 18, 5);
    table.decimal("totalIVADevuelto", 18, 5);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("documento", function(table) {
    table.dropColumn("codigoActividad");
    table.dropColumn("totalServExonerado");
    table.dropColumn("totalMercExonerada");
    table.dropColumn("totalExonerado");
    table.dropColumn("totalIVADevuelto");
    //
  });
};
