exports.up = function(knex, Promise) {
  return knex.schema.alterTable("activo", function(table) {
    table.decimal("valorOriginal", 13, 5).alter();

    table.decimal("valorActual", 13, 5).alter();
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("activo", function(table) {});
};
