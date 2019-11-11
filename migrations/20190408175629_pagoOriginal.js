exports.up = function(knex, Promise) {
  return knex.schema.alterTable("pagoDocumento", function(table) {
    table.integer("pagoOriginalId").unsigned();
    table
      .foreign("pagoOriginalId")
      .references("id")
      .inTable("pagoDocumento")
      .onDelete("RESTRICT");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("pagoDocumento", function(table) {
    table.dropForeign("pagoOriginalId");
    table.dropColumn("pagoOriginalId");
  });
};
