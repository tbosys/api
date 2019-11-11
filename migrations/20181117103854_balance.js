
exports.up = function (knex, Promise) {
  return knex.schema.createTable('registroCuentaContable', function (table) {
    table.increments();
    table.date('fecha');
    table.timestamp("createdAt");
    table.string("namespaceId", 20).notNull();


  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('registroCuentaContable')

};
