exports.up = function (knex, Promise) {
  return knex.schema.createTable('cierre', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.json("data");
    table.string("tipo");
    table.date("fecha");

    table.string("externalId");
    table.string("ownerExternalId");

    table.integer("ownerId").unsigned();
    table.foreign('ownerId').references('id').inTable('usuario').onDelete("RESTRICT");
    table.string("ownerName");

  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('cierre');
};