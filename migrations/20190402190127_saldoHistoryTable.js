exports.up = function(knex, Promise) {
  return knex.schema.createTable("saldoHistory", function(table) {
    table.increments();
    table.timestamp("createdAt").defaultTo(knex.fn.now());

    table.string("total", 15, 5);

    table.integer("documentoId").unsigned();
    table
      .foreign("documentoId")
      .references("id")
      .inTable("documento")
      .onDelete("RESTRICT");

    table.integer("clienteId").unsigned();
    table
      .foreign("clienteId")
      .references("id")
      .inTable("cliente")
      .onDelete("RESTRICT");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("saldoHistory");
};
