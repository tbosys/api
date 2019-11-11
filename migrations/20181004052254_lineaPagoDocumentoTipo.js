exports.up = async function (knex, Promise) {
  await knex.schema.alterTable('lineaPagoCxP', function (table) {
    table.string("tipo");
    table.string("moneda");
    table.dropColumn("montoPendiente");
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('lineaPagoCxP', (table) => {
    table.dropColumn("tipo");
    table.dropColumn("moneda");
    table.decimal("montoPendiente");

  });
};
