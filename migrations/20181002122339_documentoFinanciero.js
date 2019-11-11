exports.up = async function (knex, Promise) {
  await knex.schema.alterTable('documento', function (table) {
    table.boolean("financiero");
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('documento', (table) => {
    table.dropColumn("financiero");
  });
};
