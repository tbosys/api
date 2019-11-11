exports.up = function(knex, Promise) {
  return knex.schema.createTable("grupoProducto", function(table) {
    table.increments();
    table.string("name", 30);
    table.string("createdBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("grupoProducto");
};
