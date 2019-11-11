exports.up = function (knex, Promise) {
  return knex.schema.createTable('firmaDigital', function (table) {
    table.increments();
    table.string("environment");

    table.string("createdBy");
    table.string("updatedBy");

    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.string("cedula").notNull();
    table.string("username");
    table.string("password");
    table.string("ubicacion").defaultTo("01,01,01");
    table.string("email");
    table.string("name");
    table.string("pin");
    table.string("telefono");
    table.integer("consecutivoFactura");
    table.integer("consecutivoNotaCredito");
    table.integer("consecutivoNotaDebito");
    table.text("certificado", "longtext");

  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('firmaDigital');
};