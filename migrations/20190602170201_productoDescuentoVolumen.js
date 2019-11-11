exports.up = function(knex, Promise) {
  return knex.schema.createTable("productoDescuentoVolumen", function(table) {
    table.increments();

    table.string("estado");
    table.integer("cantidadMinima", 18, 5);
    table.decimal("cantidadMaxima", 18, 5);
    table.decimal("descuento", 10, 4);
    table.integer("productoId").unsigned();
    table
      .foreign("productoId")
      .references("id")
      .inTable("producto")
      .onDelete("RESTRICT");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("productoDescuentoVolumen");
};
