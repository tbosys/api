exports.up = function (knex, Promise) {

    return knex.schema.alterTable('movimientoInventario', function (table) {
        table.decimal("utilidad");
    })
  };
  
  exports.down = function (knex, Promise) {
    return knex.schema.alterTable('movimientoInventario', function (table) {
      table.dropColumn("utilidad");
    })
  };
  