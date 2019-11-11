exports.up = function (knex, Promise) {
  return knex.schema.alterTable('vendedor', function (table) {
    table.boolean("comisiona");
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('vendedor', (table) => {
    table.dropColumn("comisiona");
  });
};
