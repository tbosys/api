exports.up = function (knex, Promise) {
  return knex.schema.alterTable('firmaDigital', function (table) {
    table.decimal("tipoCambio", 15, 5);
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('firmaDigital', (table) => {
    table.dropColumn("tipoCambio");
  });
};
