exports.up = function(knex, Promise) {
  return knex.schema.alterTable("registroRecibido", function(table) {
    table.json("documentoElectronicoXml");
    table.json("mensajeHaciendaXml");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("registroRecibido", function(table) {
    table.dropColumn("documentoElectronicoXml");
    table.dropColumn("mensajeHaciendaXml");
  });
};
