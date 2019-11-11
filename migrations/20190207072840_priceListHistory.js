exports.up = function(knex, Promise) {
  return knex.schema.createTable("priceListHistory", function(table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.string("approvedBy");

    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());

    table.decimal("precio", 15, 5);
    table.decimal("precioDelta", 15, 5);
    table.decimal("descuento", 15, 5);
    table.integer("productoId").unsigned();
    table
      .foreign("productoId")
      .references("id")
      .inTable("producto")
      .onDelete("RESTRICT");

    table.integer("grupoId").unsigned();
    table
      .foreign("grupoId")
      .references("id")
      .inTable("grupo")
      .onDelete("RESTRICT");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("priceListHistory");
};
