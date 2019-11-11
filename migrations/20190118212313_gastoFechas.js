exports.up = function(knex, Promise) {
  return knex.schema.alterTable("gasto", function(table) {
    table.date("fechaProgramacion");
    table.date("fechaVencimiento");
    table.integer("plazoActual");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("gasto", table => {
    table.dropColumn("fechaProgramacion");
    table.dropColumn("fechaVencimiento");
    table.dropColumn("plazoActual");
  });
};
