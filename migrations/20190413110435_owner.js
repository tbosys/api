exports.up = function(knex, Promise) {
  return knex.schema.createTable("owner", function(table) {
    table.increments();
    table.boolean("activo").defaultTo(true);
    table.string("name");
    table.string("email");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("owner");
};
