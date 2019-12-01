exports.up = function(knex) {
  return knex.schema.createTable("table", function(table) {
    table.increments();
    table.string("name");
    table.string("title");
    table.boolean("system");
    table.string("restricted");
    table.integer("shareLevel");
    table.json("properties");
    table.string("belongsTo");
    table.string("required");
    table.json("table");
    table.json("form");
    table.string("createdBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("table");
};
