exports.up = function(knex, Promise) {
  return knex.schema.alterTable("funcion", function(table) {
    table.string("departamento");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("funcion", function(table) {
    table.dropColumn("departamento");
  });
};
