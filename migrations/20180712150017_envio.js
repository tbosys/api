exports.up = function (knex, Promise) {
  return knex.schema.createTable('envio', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.string("name");

    table.timestamp("fechaIngreso").defaultTo(knex.fn.now());
    table.timestamp("fechaEnvio").defaultTo(knex.fn.now());
    table.timestamp("fechaRecibo").defaultTo(knex.fn.now());
    table.timestamp("fechaEntrega").defaultTo(knex.fn.now());

    table.string("ownerExternalId", 20);

    table.integer("ownerId").unsigned();
    table.foreign('ownerId').references('id').inTable('usuario').onDelete("RESTRICT");

    table.string("ownerName");

    table.unique(['name','namespaceId'], "envio")
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('envio');
};