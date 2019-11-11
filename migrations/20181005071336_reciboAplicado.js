exports.up = function (knex, Promise) {
  return knex.schema.alterTable('pagoDocumento', function (table) {
    table.date("fechaIngreso");
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('pagoDocumento', (table) => {
    table.dropColumn("fechaIngreso");
  });
};
