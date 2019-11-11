exports.up = function(knex, Promise) {
  return knex.schema.createTable("okr", function(table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.string("name");
    table.string("objective");
    table.date("fechaInicio");
    table.date("fechaFin");
    table.string("metric");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("okr");
};
