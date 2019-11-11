exports.up = function (knex, Promise) {
  return knex.schema.alterTable('cliente', function (table) {
    table.json("correoDocumentosElectronicosCC");
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('cliente', (table) => {
    table.dropColumn("correoDocumentosElectronicosCC");

  });
};
