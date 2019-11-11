exports.up = function (knex, Promise) {
  return knex.schema.createTable('registroRecibido', function (table) {
    table.increments();
    table.string("createdBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.string("from");
    table.string("to");
    table.string("emailId");
    table.json("archivos");
    table.string("estado", 25).defaultTo("por procesar");
    table.string("tipo");
    table.unique(['emailId', 'namespaceId'])
    table.text("respuestaHacienda", "longtext");
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('registroRecibido');
};