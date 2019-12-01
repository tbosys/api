exports.up = function(knex, Promise) {
  return knex.schema.createTable("code", function(table) {
    table.increments();
    table.integer("code");
    table.string("email");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("code", function(table) {});
};
