exports.up = function (knex, Promise) {
  return knex.schema.alterTable('movimientoInventario', function (table) {
    table.json("exoneracion");
    table.decimal("excento", 15, 5);
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('movimientoInventario', (table) => {
    table.dropColumn("exoneracion");
    table.dropColumn("excento");
  });
};
