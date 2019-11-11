exports.up = function (knex, Promise) {
  return knex.schema.createTable('segmento', function (table) {
    table.increments();

    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();

    table.string("name", 50).notNull();

    table.integer("ownerId").unsigned();
    table.foreign('ownerId').references('id').inTable('usuario').onDelete("RESTRICT");

    table.string('ownerName');

    table.unique(['name', 'namespaceId'], "segmento")

  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('segmento')
};
