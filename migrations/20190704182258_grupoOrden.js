exports.up = function(knex, Promise) {
  return knex.schema.alterTable("grupo", function(table) {
    table.integer("orden");
  });
};
//
exports.down = function(knex, Promise) {
  return knex.schema.alterTable("grupo", function(table) {
    table.dropColumn("orden");
  });
};
