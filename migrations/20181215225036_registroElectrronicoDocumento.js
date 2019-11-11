exports.up = function(knex, Promise) {
  return knex.schema.alterTable("registroElectronico", function(table) {
    table.integer("documentoId").unsigned();
    table
      .foreign("documentoId")
      .references("id")
      .inTable("documento")
      .onDelete("RESTRICT");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("registroElectronico", table => {
    table.dropForeign("documentoId");
    table.dropColumn("documentoId");
  });
};
