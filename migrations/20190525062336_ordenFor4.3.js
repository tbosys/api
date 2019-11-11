exports.up = function(knex, Promise) {
  return knex.schema.alterTable("orden", function(table) {
    table.string("remplazaDocumentoClave");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("orden", function(table) {
    table.dropColumn("remplazaDocumentoClave");
  });
};
