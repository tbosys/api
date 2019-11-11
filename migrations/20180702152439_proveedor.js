exports.up = function (knex, Promise) {
  return knex.schema.createTable('proveedor', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());

    table.string("namespaceId", 20).notNull();
    table.string("name", 80).notNull();
    table.boolean("activo");
    table.string("tipoCedula");
    table.string("cedula").notNull();
    table.string("moneda");
    table.string("email");
    table.string("telefono");
    table.integer("plazoPago");
    table.string("descripcion");
    table.string("formaPago");
    table.string("CuentaBancaria");

    table.json("ubicacion");

    table.string("externalId");
    table.string("ownerExternalId");

    table.integer("ownerId").unsigned();
    table.foreign('ownerId').references('id').inTable('usuario').onDelete("RESTRICT");

    table.string("ownerName");

    table.unique(['name','externalId', 'namespaceId'], "proveedor")

  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('proveedor');
};
