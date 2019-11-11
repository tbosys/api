exports.up = function(knex, Promise) {
  return knex.schema.alterTable("pagoDocumento", function(table) {
    table.integer("consecutivo");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("pagoDocumento", function(table) {
    table.dropColumn("consecutivo");
  });
};
