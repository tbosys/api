exports.up = function (knex, Promise) {
  return knex.schema.alterTable('documento', function (table) {
    table.text("resumen");
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('documento', (table) => {
    table.dropColumn("resumen");
  });
};
