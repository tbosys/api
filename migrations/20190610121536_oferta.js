exports.up = function(knex, Promise) {
  return knex.schema.createTable("productoOferta", function(table) {
    table.increments();
    table.string("name");
    table.string("estado");
    table.date("fechaVencimiento");
    table.decimal("precio");
    table.boolean("desde");
    table.decimal("descuento");
    table.string("fotoUrl");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("productoOferta");
};
