exports.up = function(knex, Promise) {
  return knex.schema.alterTable("orden", function(table) {
    table.string("pdf");
    table.integer("documentoId").unsigned();
    table
      .foreign("documentoId")
      .references("id")
      .inTable("documento")
      .onDelete("RESTRICT");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("orden", table => {
    table.dropColumn("pdf");
    table.dropForeign("documentoId");
    table.dropColumn("documentoId");
  });
};
