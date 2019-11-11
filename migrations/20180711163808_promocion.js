exports.up = function (knex, Promise) {
  return knex.schema.createTable('promocion', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.string("name", 50);
    table.string("fuente");
    table.date("fechaVencimiento");
    table.string("url");


    table.unique(['name', 'namespaceId'], "promocion")
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('promocion');
};