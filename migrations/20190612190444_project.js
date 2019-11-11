exports.up = function(knex, Promise) {
  return knex.schema.createTable("project", function(table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.string("name");
    table.string("descripcion");
    table.string("estado");
    table.date("fechaInicio");
    table.date("fechaFin");
    table.string("prioridad");
    table.integer("avance");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.integer("ownerId").unsigned();
    table
      .foreign("ownerId")
      .references("id")
      .inTable("usuario")
      .onDelete("RESTRICT");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("project");
};
