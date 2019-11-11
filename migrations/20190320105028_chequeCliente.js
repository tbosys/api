exports.up = function(knex, Promise) {
  return knex.schema.alterTable("cheque", function(table) {
    table.integer("clienteId").unsigned();
    table
      .foreign("clienteId")
      .references("id")
      .inTable("cliente")
      .onDelete("RESTRICT");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("cheque", function(table) {
    table.dropForeign("clienteId");
    table.dropColumn("clienteId");
  });
};
