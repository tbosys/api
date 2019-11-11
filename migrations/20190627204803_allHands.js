exports.up = function(knex, Promise) {
  return knex.schema.createTable("allHands", function(table) {
    table.increments();

    table.string("createdBy");
    table.string("descripcion");
    table.string("checklist");

    table.string("estado");
    table.timestamp("createdAt").defaultTo(knex.fn.now());

    table.integer("ownerId").unsigned();
    table
      .foreign("ownerId")
      .references("id")
      .inTable("usuario")
      .onDelete("RESTRICT");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("allHands");
};
