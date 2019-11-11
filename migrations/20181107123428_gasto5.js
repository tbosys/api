
exports.up = function (knex, Promise) {
  return knex.schema.alterTable('gasto', function (table) {
    table.string("emailId");

    table.integer("registroRecibidoId").unsigned();
    table.foreign('registroRecibidoId').references('id').inTable('registroRecibido').onDelete("RESTRICT");

  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('gasto', (table) => {
    table.dropForeign("registroRecibidoId");
    table.dropColumn("registroRecibidoId");
    table.dropColumn("emailId");
  });
};
