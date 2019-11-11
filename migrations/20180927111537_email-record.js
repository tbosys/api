exports.up = function (knex, Promise) {
  return knex.schema.createTable('emailRecord', function (table) {
    table.increments();
    table.string("namespaceId", 20);

    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.string("email");
    table.string("result");
    table.string("tipo");
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('emailRecord');
};
