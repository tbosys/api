exports.up = function(knex, Promise) {
  return knex.schema.alterTable("productoDescuentoVolumen", function(table) {
    table.string("name");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("productoDescuentoVolumen", function(table) {
    table.dropColumn("name");
  });
};
