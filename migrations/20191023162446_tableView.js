exports.up = function(knex, Promise) {
  return knex.schema.createTable("tableView", function(table) {
    table.increments();
    table.string("name");
    table.string("type");
    table.string("table");
    table.json("filters");
    table.json("columns");
    table.string("createdBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.integer("ownerId").unsigned();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("tableView");
};
