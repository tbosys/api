
exports.up = function (knex, Promise) {
  return knex.schema.createTable('clienteSegmento', function (table) {
    table.increments();
    table.integer("clienteId").unsigned();
    table.integer("segmentoId").unsigned();
    table.foreign('clienteId').references('id').inTable('cliente').onDelete("CASCADE");
    table.foreign('segmentoId').references('id').inTable('segmento').onDelete("CASCADE");
    table.string("namespaceId", 20).notNull();

  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('clienteSegmento');

};


