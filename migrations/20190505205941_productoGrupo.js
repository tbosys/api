exports.up = function(knex, Promise) {
  return knex.schema.alterTable("producto", function(table) {
    table.integer("grupoProductoId").unsigned();
    table
      .foreign("grupoProductoId")
      .references("id")
      .inTable("grupoProducto")
      .onDelete("RESTRICT");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("producto", function(table) {
    table.dropForeign("grupoProductoId");
    table.dropColumn("grupoProductoId");
  });
};
