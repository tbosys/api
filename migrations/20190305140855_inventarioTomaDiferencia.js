exports.up = function(knex, Promise) {
  return knex.schema.alterTable("inventarioToma", function(table) {
    table.decimal("diferencia", 18, 5);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("inventarioToma", function(table) {
    table.dropColumn("diferencia");
  });
};
