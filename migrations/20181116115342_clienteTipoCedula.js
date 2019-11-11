exports.up = function (knex, Promise) {
  return knex.schema.alterTable('cliente', function (table) {
    table.string("tipoCedula");
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('cliente', (table) => {
    table.dropColumn("tipoCedula");

  });
};
