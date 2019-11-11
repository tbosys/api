exports.up = function(knex, Promise) {
  return knex.schema.createTable("importacion", function(table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.string("approvedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("estado", 30);
    table.string("tipo", 8);
    table.text("descripcion");
    table.string("name", 51);
    table.string("codigo");
    table.string("pdfFactura");
    table.string("pdfBL");
    table.string("moneda", 3);
    table.decimal("tipoCambio", 15, 5);

    table.decimal("total", 18, 5);
    table.date("fechaArribo");
    table.date("fechaPedido");
    table.integer("ownerId");

    table.json("importacionLinea");

    table.integer("proveedorId").unsigned();
    table
      .foreign("proveedorId")
      .references("id")
      .inTable("proveedor")
      .onDelete("RESTRICT");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("importacion");
};
