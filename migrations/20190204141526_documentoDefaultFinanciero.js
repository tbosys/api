exports.up = function(knex, Promise) {
    return knex.schema
      .alterTable("documento", function(table) {
        table.boolean("financiero").defaultTo(0).alter();
      })
  };
  
  exports.down = function(knex, Promise) {
    return knex.schema.alterTable("documento", function(table) {
    });
  };
  