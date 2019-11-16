exports.up = function(knex, Promise) {
  return knex.schema.createTable("rol", function(table) {
    table.increments();
    table.string("table");
    table.json("actions");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("rol");
};
