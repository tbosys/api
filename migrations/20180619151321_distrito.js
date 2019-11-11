exports.up = function (knex, Promise) {
  return knex.schema.createTable('distrito', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("name", 50).notNull();
    table.string("provincia", 50).notNull();
    table.integer("provinciaCode").notNull();
    table.string("canton", 50).notNull();
    table.integer("cantonCode").notNull();
    table.integer("distritoCode").notNull();
    table.string("namespaceId", 20).notNull();

    table.unique(['name', 'provincia', 'canton', 'namespaceId'], "distrito")

  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('distrito');
};
