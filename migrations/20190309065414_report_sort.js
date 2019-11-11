exports.up = function(knex, Promise) {
  return knex.schema.alterTable("reporte", function(table) {
    table.json("sort");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("reporte", function(table) {
    table.dropColumn("sort");
  });
};
