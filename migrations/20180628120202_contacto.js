exports.up = function (knex, Promise) {
  return knex.schema.createTable('contacto', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.string("name", 100).notNull();
    table.boolean("activo");
    table.string("cedula");
    table.string("email");
    table.string("mobile");
    table.string("direccion");
    table.string("rol");
    table.text("descripcion");

    table.string("externalId");
    table.string("ownerExternalId");
    table.string("clienteExternalId");

    table.integer("clienteId").unsigned();
    table.foreign('clienteId').references('id').inTable('cliente').onDelete("RESTRICT");


    table.integer("ownerId").unsigned();
    table.foreign('ownerId').references('id').inTable('usuario').onDelete("RESTRICT");

    table.string("ownerName");

    table.unique(['name','externalId', 'clienteId', 'namespaceId'], "contacto")

  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('contacto');
};
