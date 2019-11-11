exports.up = function (knex, Promise) {
  return knex.schema.createTable('usuario', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20);

    table.boolean("activo").defaultTo(true);
    table.string("name");
    table.string("cedula", 15);
    table.string("email", 50)
    table.string("mobile");
    table.string("externalId");

    table.text("roles");

    table.unique(['email', 'externalId', 'namespaceId'], "usuario")
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('usuario');
};