exports.up = function (knex, Promise) {
  return knex.schema.createTable('atributoProducto', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.string("name", 50);
    table.string("tipo");
    table.string("descripcion");
    table.string("url");

    table.integer("productoId").unsigned();
    table.foreign('productoId').references('id').inTable('producto').onDelete("RESTRICT");

    table.unique(['name', 'productoId', 'namespaceId'], "attprod")
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('atributoProducto');
};