exports.up = function(knex, Promise) {
  return knex.schema.alterTable("documento", function(table) {
    table.string("pdf");
    table.string("xml");
    table.string("respuestaXml");
    table.string("descripcionEstado");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("documento", table => {
    table.dropColumn("pdf");
    table.dropColumn("xml");
    table.dropColumn("respuestaXml");
    table.dropColumn("descripcionEstado");
  });
};
