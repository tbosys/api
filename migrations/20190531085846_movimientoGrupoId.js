exports.up = function (knex, Promise) {

    return knex.schema.alterTable('movimientoInventario', function (table) {
        table.integer("grupoId").unsigned();
        table.foreign('grupoId').references('id').inTable('grupo').onDelete("RESTRICT");
    })
  };
  
  exports.down = function (knex, Promise) {
    return knex.schema.alterTable('movimientoInventario', function (table) {
      table.dropForeign('grupoId');
      table.dropColumn("grupoId");
    })
  };
  