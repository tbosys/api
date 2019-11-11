exports.up = function(knex, Promise) {
  return knex.schema.alterTable("saldo", function(table) {
    table.json("history");
    table.boolean("activo");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("saldo", function(table) {
    table.dropColumn("history");
    table.dropColumn("activo");
  });
};
