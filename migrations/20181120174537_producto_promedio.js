exports.up = function (knex, Promise) {
  return knex.schema.alterTable('producto', function (table) {
    table.decimal("promedioVentas", 15, 7);
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('producto', (table) => {
    table.dropColumn("promedioVentas");

  });
};
