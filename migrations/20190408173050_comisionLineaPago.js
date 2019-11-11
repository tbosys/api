exports.up = function(knex, Promise) {
  return knex.schema.alterTable("comisionHistorico", function(table) {
    table.integer("lineaPagoDocumentoId").unsigned();
    table
      .foreign("lineaPagoDocumentoId")
      .references("id")
      .inTable("lineaPagoDocumento")
      .onDelete("RESTRICT");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("comisionHistorico", function(table) {
    table.dropForeign("lineaPagoDocumentoId");
    table.dropColumn("lineaPagoDocumentoId");
  });
};
