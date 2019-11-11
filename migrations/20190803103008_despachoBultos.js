exports.up = function(knex, Promise) {
    return knex.schema.alterTable("despacho", function(table) {
      table.integer("bultos");
    });
  };
  
  exports.down = function(knex, Promise) {
    return knex.schema.alterTable("despacho", function(table) {
        table.dropColumn("bultos");
    });
}