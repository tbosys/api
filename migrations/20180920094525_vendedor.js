exports.up = function(knex, Promise) {
  return knex.schema.createTable("vendedor", function(table) {
    table.increments();
    table.string("namespaceId", 20).notNull();
    table.string("name");
    table.integer("usuarioId").unsigned();
    table
      .foreign("usuarioId")
      .references("id")
      .inTable("usuario")
      .onDelete("RESTRICT");

    table.string("externalId", 20);

    table.unique(["usuarioId", "namespaceId"]);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("vendedor");
};
