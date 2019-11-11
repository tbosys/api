exports.up = function(knex, Promise) {
  return knex.schema.createTable("activo", function(table) {
    table.increments();
    table.boolean("activo").defaultTo(true);
    table.string("name");
    table.string("descripcion");
    table.string("departamento");
    table.string("numero");
    table.string("tipoNumero");
    table.date("fechaCompra");
    table.string("historialDepreciacion");
    table.decimal("valorOriginal");
    table.decimal("valorActual");
    table.integer("ownerId");
    table.string("createdBy");
    table.string("updatedBy");
    table.string("approvedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.integer("proveedorId").unsigned();
    table
      .foreign("proveedorId")
      .references("id")
      .inTable("proveedor")
      .onDelete("RESTRICT");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("activo");
};
