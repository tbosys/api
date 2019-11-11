
exports.up = function (knex, Promise) {
  return knex.schema.alterTable('gasto', function (table) {

    table.string("clave");
    table.string("linkFacturaXml");


  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('gasto', (table) => {

    table.dropColumn("clave");
    table.dropColumn("linkFacturaXml");
  });
};
