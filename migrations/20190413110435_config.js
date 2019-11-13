exports.up = function(knex, Promise) {
    return knex.schema.createTable("config", function(table) {
      table.increments();
      table.string("title").notNullable();
      table.string("key").notNullable().unique();
      table.json("value");
    });
  };
  
  exports.down = function(knex, Promise) {
    return knex.schema.dropTable("config");
  };
  