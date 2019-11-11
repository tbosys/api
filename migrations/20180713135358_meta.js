
exports.up = function(knex, Promise) {
    return knex.schema.createTable('meta', function(table) {
      table.increments();
      table.string("createdBy");
      table.string("updatedBy");
      table.timestamp("createdAt").defaultTo(knex.fn.now());
      table.timestamp("updatedAt").defaultTo(knex.fn.now());
      table.string("namespaceId").notNull();
  
      table.string("name");
      table.string("tipo"); 
      table.string("clienteReferencia"); 
      table.string("productoReferencia"); 
      table.string("clienteValue"); 
      table.string("productoValue"); 
      table.decimal("monto", 15,5);
      table.decimal("montoActual", 15,5);
      table.decimal("montoDia", 15,5);
      table.decimal("porcentaje");

      table.string("externalId");
      table.string("ownerExternalId");

    table.integer("ownerId").unsigned();
    table.foreign('ownerId').references('id').inTable('usuario').onDelete("RESTRICT");

    table.string("ownerName");

    table.unique(['name','externalId', 'namespaceId'], "meta")

  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('meta');
};