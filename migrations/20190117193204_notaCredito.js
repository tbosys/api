exports.up = function(knex, Promise) {
  return knex.schema.createTable("nota", function(table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.string("estado", 30);
    table.string("tipo", 8);
    table.text("descripcion");
    table.string("moneda", 3);
    table.decimal("tipoCambio", 15, 5);
    table.decimal("totalComprobante", 18, 5);
    table.string("approveBy");

    table.integer("clienteId").unsigned();
    table
      .foreign("clienteId")
      .references("id")
      .inTable("cliente")
      .onDelete("RESTRICT");

    table.integer("documentoId").unsigned();
    table
      .foreign("documentoId")
      .references("id")
      .inTable("documento")
      .onDelete("RESTRICT");

    table.integer("ownerId").unsigned();
    table
      .foreign("ownerId")
      .references("id")
      .inTable("usuario")
      .onDelete("RESTRICT");

    table.string("ownerName");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("nota");
};
