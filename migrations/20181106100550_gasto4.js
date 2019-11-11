
exports.up = function (knex, Promise) {
  return knex.schema.alterTable('gasto', function (table) {
    table.json("mensajeEnviadoXml");
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('gasto', (table) => {
    table.dropColumn("mensajeEnviadoXml");
  });
};
