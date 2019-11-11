exports.up = function (knex, Promise) {
  return knex.schema.alterTable('gasto', function (table) {
    table.json("attachments");
    table.string("respuestaXML");
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('gasto', (table) => {
    table.dropColumn("respuestaXML");
    table.dropColumn("attachments");

  });
};
