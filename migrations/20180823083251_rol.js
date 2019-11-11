exports.up = function (knex, Promise) {
  return knex.schema.createTable('rol', function (table) {
    table.increments();
    table.string("name");
    table.string("namespaceId");
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('rol');
};