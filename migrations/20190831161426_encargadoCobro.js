exports.up = function(knex, Promise) {
    return knex.schema.createTable("cobroEncargado", function(table) {
      table.increments();
      table.string("createdBy");
      table.string("updatedBy");
      table.timestamp("createdAt").defaultTo(knex.fn.now());
      table.timestamp("updatedAt").defaultTo(knex.fn.now());
      table.boolean("activo").defaultTo(true);
      table.string("name");
      table.string("email");
    });
  };
  
  exports.down = function(knex, Promise) {
    return knex.schema.dropTable("cobroEncargado");
  };
  