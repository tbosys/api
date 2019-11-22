exports.up = function(knex, Promise) {
  return knex.schema.createTable("list", function(table) {
    table.increments();
    table.string("createdBy");
    table.string("name");
    table.string("type");
    table.string("table");
    table.json("filters");
    table.json("sorts");
    table.string("columns");
    table.string("sums");
    table.string("groups");
    table.string("folder").default("all");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.integer("ownerId").unsigned();
    table.unique("name", "table", "type");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("list");
};
