exports.up = function(knex, Promise) {
  return knex.schema.alterTable("inventarioHistorico", function(table) {
    table.decimal("costo", 18, 5);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("inventarioHistorico", function(table) {
    table.dropColumn("costo");
  });
};
