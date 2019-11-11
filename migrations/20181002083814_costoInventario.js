exports.up = async function (knex, Promise) {
  await knex.schema.alterTable('costoHistorico', function (table) {
    table.decimal("inventarioInicial", 18, 5);
    table.decimal("inventarioFinal", 18, 5);
    table.decimal("inventarioIngresado", 18, 5);
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('costoHistorico', (table) => {
    table.dropColumn("inventarioInicial");
    table.dropColumn("inventarioFinal");
    table.dropColumn("inventarioIngresado");
  });
};
