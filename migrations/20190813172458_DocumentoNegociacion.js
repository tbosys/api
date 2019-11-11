exports.up = function(knex, Promise) {
  return knex.schema.alterTable("documento", function(table) {
    table.boolean("negociado");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("documento", function(table) {
    table.dropColumn("negociado");
  });
};
