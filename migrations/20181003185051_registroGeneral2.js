exports.up = async function (knex, Promise) {
  await knex.schema.alterTable('registroGeneral', function (table) {
    table.date("fecha");
    table.string("momento");
    table.decimal("monto", 18, 5).alter();

  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('registroGeneral', (table) => {
    table.dropColumn("fecha");
    table.dropColumn("momento");
  });
};
