exports.up = function(knex, Promise) {
  return knex.schema.alterTable("contacto", function(table) {
    table.boolean("bounce");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("contacto", function(table) {
    table.dropColumn("bounce");
  });
};
