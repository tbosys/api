exports.up = function(knex, Promise) {
  return knex.schema.alterTable("registroRecibido", function(table) {
    table.boolean("aprobadoPorResponsable");

    table.integer("proveedorId").unsigned();
    table
      .foreign("proveedorId")
      .references("id")
      .inTable("proveedor")
      .onDelete("RESTRICT");

    table.integer("ownerId").unsigned();
    table
      .foreign("ownerId")
      .references("id")
      .inTable("usuario")
      .onDelete("RESTRICT");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("registroRecibido", function(table) {
    table.dropForeign("proveedorId");
    table.dropColumn("proveedorId");
    //table.dropForeign("ownerId");
    table.dropColumn("ownerId");
    table.dropColumn("aprobadoPorResponsable");
  });
};
