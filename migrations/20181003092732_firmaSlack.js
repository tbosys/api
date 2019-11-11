exports.up = async function (knex, Promise) {
  await knex.schema.alterTable('firmaDigital', function (table) {
    table.string("slackWebHook");
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('firmaDigital', (table) => {
    table.dropColumn("slackWebHook");
  });
};
