exports.up = function(knex) {
  return knex.schema.createTable("orden", function(table) {
    table.increments();
    table.string("name");
    table.string("code");
    table.string("status");
    table.integer("clienteId").unsigned();
    table.integer("ownerId").unsigned();

    table
      .foreign("clienteId")
      .references("id")
      .inTable("cliente");

    table
      .foreign("ownerId")
      .references("id")
      .inTable("owner");

    table.json("lineas");
    table.decimal("total", 18, 5);
    table.string("createdBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("orden");
};
