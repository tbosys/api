exports.up = function (knex, Promise) {
  return knex.schema.createTable('transporteContacto', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.string("name", 100).notNull();
    table.boolean("activo");
    table.string("telefono");
    table.string("descripcion");

    table.string("ownerName");
    table.string("transporteName");

    table.integer("ownerId").unsigned();
    table.foreign('ownerId').references('id').inTable('usuario').onDelete("RESTRICT");

    table.integer("transporteId").unsigned();
    table.foreign('transporteId').references('id').inTable('transporte').onDelete("RESTRICT");

    table.unique(['name', 'namespaceId'], "transportec")

  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('transporteContacto');
};
