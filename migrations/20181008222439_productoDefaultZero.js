exports.up = async function (knex, Promise) {
  await knex.schema.alterTable('producto', function (table) {
    table.decimal("inventario", 18, 5).defaultTo(0).alter();

  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('producto', (table) => {
  });
};
