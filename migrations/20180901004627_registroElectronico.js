exports.up = function (knex, Promise) {
  return knex.schema.createTable('registroElectronico', function (table) {
    table.increments();
    table.string("environment");
    table.string("createdBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.string("consecutivo").notNull();
    table.string("tipo").notNull();
    table.string("pdf");
    table.string("xml");

    table.string("respuestaXml");
    table.string("clave", 51);
    table.text("respuesta", "longtext");
    table.string("estado", 25).defaultTo("por imprimir");
    table.integer("tipoId").notNull();
    table.boolean("completo").defaultTo(false);

    table.integer("clienteId").unsigned();
    table.foreign('clienteId').references('id').inTable('cliente').onDelete("RESTRICT");

  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('registroElectronico');
};