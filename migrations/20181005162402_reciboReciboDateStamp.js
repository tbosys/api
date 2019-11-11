exports.up = function (knex, Promise) {
  return knex.schema.alterTable('pagoDocumento', function (table) {
    table.datetime("fechaIngreso").alter();
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('pagoDocumento', (table) => {
  });
};
