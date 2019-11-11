exports.up = function(knex, Promise) {
  return knex.schema.alterTable("okr", function(table) {
    table.string("departamento");
    table.json("kr");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("okr", function(table) {
    table.dropColumn("departamento");
    table.dropColumn("kr");
  });
};
