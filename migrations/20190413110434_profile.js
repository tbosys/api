exports.up = function(knex, Promise) {
  return knex.schema.createTable("profile", function(table) {
    table.increments();
    table.string("name");
    table.json("roles");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("profile");
};
