exports.up = function(knex, Promise) {
  return knex.schema.alterTable("owner", function(table) {
    table.boolean("comisiona");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("owner", function(table) {
    table.dropColumn("comisiona");
  });
};
