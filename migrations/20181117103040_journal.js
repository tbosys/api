exports.up = function (knex, Promise) {
  return knex.schema.createTable('journal', function (table) {
    table.increments();
    table.string("name", 50).notNull();
    table.date('fecha');

    table.string('descripcion');
    table.boolean('isManual').defaultTo(true);
    table.boolean('isDraft');

    table.json('journalItem');

    table.string("estado").defaultTo("por aplicar");
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();

    table.integer("ownerId").unsigned();
    table.foreign('ownerId').references('id').inTable('usuario').onDelete("RESTRICT");
    table.string("ownerName");
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('journal')
};
