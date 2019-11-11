exports.up = function(knex, Promise) {
  return knex.schema.createTable("productoCombo", function(table) {
    table.increments();
    table.string("name");
    table.date("fechaVencimiento");
    table.string("productoIds");
    table.string("estado");
    table.json("precios");
    table.decimal("precio", 18, 5);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("productoCombo");
};
