exports.up = async function (knex, Promise) {
  await knex.schema.alterTable('registroGeneral', function (table) {
    table.string("tipoPlazo");
    table.string("field");
    table.string("metadataType");
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('registroGeneral', (table) => {
    table.dropColumn("tipoPlazo");
    table.dropColumn("field");
    table.dropColumn("metadataType");
  });
};
