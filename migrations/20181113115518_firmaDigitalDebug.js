exports.up = function (knex, Promise) {
  return knex.schema.alterTable('firmaDigital', function (table) {
    table.boolean("debugging");
    table.date("lastDebugDate");
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('firmaDigital', (table) => {
    table.dropColumn("debugging");
    table.dropColumn("lastDebugDate");
  });
};
