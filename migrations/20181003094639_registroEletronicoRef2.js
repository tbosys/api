exports.up = async function (knex, Promise) {
  await knex.schema.alterTable('registroElectronico', function (table) {
    table.string("emailPrincipal");
    table.string("cedula");
    table.string("slackWebHook");
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('registroElectronico', (table) => {
    table.dropColumn("emailPrincipal");
    table.dropColumn("cedula");
    table.dropColumn("slackWebHook");
  });
};
