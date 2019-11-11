exports.up = function (knex, Promise) {
  return knex.schema.createTable('registro', function (table) {
    table.increments();

    table.string("metadataType");
    table.integer("metadataId");
    table.string("field");
    table.date("fecha");

    table.string("departamento");
    table.string("categoria");

    table.decimal("monto", 18, 5);

    table.json("metadata");
    table.string("createdBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.integer("ownerId").unsigned();
    table.foreign('ownerId').references('id').inTable('usuario').onDelete("RESTRICT");
    table.string("ownerExternalId");
    table.string("externalId");
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('registro');
};