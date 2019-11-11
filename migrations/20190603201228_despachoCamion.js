exports.up = function(knex, Promise) {
  return knex.schema.alterTable("despacho", function(table) {
    table.string("camion");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("despacho", function(table) {
    table.dropColumn("camion");
  });
};
