exports.up = function(knex, Promise) {
  return knex.schema.alterTable("gasto", function(table) {
    table.unique("clave");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("gasto", table => {
    table.dropUnique("clave");
  });
};
