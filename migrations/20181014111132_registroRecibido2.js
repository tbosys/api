
exports.up = function (knex, Promise) {
  return knex.schema.alterTable('registroRecibido', function (table) {
    table.string("pdf");
    table.string("xml");
    table.string("respuestaXml");
    table.string("mensajeXml");
    table.string("clave");
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('registroRecibido', (table) => {
    table.dropColumn("pdf");
    table.dropColumn("xml");
    table.dropColumn("respuestaXml");
    table.dropColumn("mensajeXml");
    table.dropColumn("clave");
  });
};
