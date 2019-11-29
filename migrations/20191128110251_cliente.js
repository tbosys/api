exports.up = function(knex) {
  return knex.schema.createTable("cliente", function(table) {
    table.increments();
    table.string("name");
    table.string("code");
    table.integer("ownerId").unsigned();

    table
      .foreign("ownerId")
      .references("id")
      .inTable("owner");

    table.string("createdBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("cliente");
};
