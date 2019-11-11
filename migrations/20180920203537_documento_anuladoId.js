exports.up = function (knex, Promise) {
  return knex.schema.alterTable('documento', function (table) {
    table.integer("documentoAnuladorId").unsigned();
    table.foreign('documentoAnuladorId').references('id').inTable('documento').onDelete("RESTRICT");
    table.integer("documentoAnuladoDeId").unsigned();
    table.foreign('documentoAnuladoDeId').references('id').inTable('documento').onDelete("RESTRICT");
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('documento', (table) => {
    table.dropForeign('documentoAnuladorId');
    table.dropForeign('documentoAnuladoDeId');
    table.dropColumn("documentoAnuladorId");
    table.dropColumn("documentoAnuladoDeId");
  });
};
