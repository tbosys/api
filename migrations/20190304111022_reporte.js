exports.up = function(knex, Promise) {
  return knex.schema.createTable("reporte", function(table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.string("name");
    table.string("table");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.json("filters");
    table.string("fields");
    table.string("sums");
    table.string("groups");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("reporte");
};
