exports.up = function(knex, Promise) {
  return knex.schema.alterTable("project", function(table) {
    table.string("resumenSituacion");
    table.string("departamento");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("project", function(table) {
    table.dropColumn("departamento");
    table.dropColumn("resumenSituacion");
  });
};
