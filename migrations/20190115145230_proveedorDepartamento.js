exports.up = function(knex, Promise) {
    return knex.schema.alterTable("proveedor", function(table) {
      table.json("departamento");
    });
  };
  
  exports.down = function(knex, Promise) {
    return knex.schema.alterTable("proveedor", function(table) {
      table.dropColumn("departamento");
    });
  };
  