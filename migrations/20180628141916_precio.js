const v1 = require('../triggers/precio/v1');


exports.up = function (knex, Promise) {
  return knex.schema.createTable('precio', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.string("name", 25).notNull();
    table.decimal("precio", 15, 5).notNull();

    table.string("productoExternalId");

    table.integer("productoId").unsigned();
    table.foreign('productoId').references('id').inTable('producto').onDelete("RESTRICT");

    table.unique(['name', 'productoId', 'namespaceId'], "precio")

  }).then(function () {
    return Promise.mapSeries(v1.up, (sql) => knex.schema.raw(sql))
  })

};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('precio');
};