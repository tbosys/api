exports.up = function(knex, Promise) {
  return knex.schema.alterTable("okr", function(table) {
    table.integer("progress");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("okr", function(table) {
    table.dropColumn("progress");
  });
};
