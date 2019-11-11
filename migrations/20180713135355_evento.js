exports.up = function (knex, Promise) {
  return knex.schema.createTable('evento', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.string("name");
    table.string("tipo");
    table.string("departamento");
    table.string("descripcion");
    table.timestamp("recordatorio").defaultTo(knex.fn.now());

    table.string("externalId");
    table.string("ownerExternalId");
    table.string("clienteExternalId");

    table.integer("clienteId").unsigned();
    table.foreign('clienteId').references('id').inTable('cliente').onDelete("RESTRICT");

    table.integer("ownerId").unsigned();
    table.foreign('ownerId').references('id').inTable('usuario').onDelete("RESTRICT");

    table.string("ownerName");

  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('evento');
};