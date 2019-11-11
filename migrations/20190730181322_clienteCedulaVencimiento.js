exports.up = function(knex, Promise) {
    return knex.schema.alterTable("cliente", function(table) {
      table.date("vencimientoCedula");
    });
  };
  
  exports.down = function(knex, Promise) {
    return knex.schema.alterTable("cliente", function(table) {
        table.dropColumn("vencimientoCedula");
    });
}