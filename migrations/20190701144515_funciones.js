exports.up = function(knex, Promise) {
  return knex.schema.createTable("funcion", function(table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.string("name");
    table.string("descripcion");
    table.string("prioridad");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.integer("ownerId").unsigned();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("funcion");
};
