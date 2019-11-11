exports.up = async function (knex, Promise) {
  await knex.schema.alterTable('registro', function (table) {
    table.string("tipoPlazo");
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('registro', (table) => {
    table.dropColumn("tipoPlazo");


  });
};
