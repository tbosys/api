exports.up = function (knex, Promise) {
  return knex.schema.alterTable('proveedor', function (table) {
    table.string("clase");
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('proveedor', (table) => {
    table.dropColumn("clase");
  });
};
