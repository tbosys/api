exports.up = function (knex, Promise) {
  return knex.schema.alterTable('log', function (table) {
    table.string("requestId");
    table.integer("status");
  })
};



exports.down = function (knex, Promise) {
  return knex.schema.alterTable('log', (table) => {
    table.dropColumn("requestId");
    table.dropColumn("status");
  });
};
