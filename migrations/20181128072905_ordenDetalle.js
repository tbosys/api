exports.up = function (knex, Promise) {
  return knex.schema.alterTable('orden', function (table) {
    table.text("resumen");
    table.boolean("autoAplicar");
    table.date("fechaEntrega");
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('orden', (table) => {
    table.dropColumn("resumen");
    table.dropColumn("autoAplicar");
    table.dropColumn("fechaEntrega");
  });
};
