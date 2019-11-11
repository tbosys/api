exports.up = function (knex, Promise) {
  return knex.schema.alterTable('producto', function (table) {
    table.decimal("porcentajeComision", 10, 5);
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('producto', (table) => {
    table.dropColumn("porcentajeComision");
  });
};
