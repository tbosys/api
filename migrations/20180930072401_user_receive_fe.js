exports.up = function (knex, Promise) {
  return knex.schema.alterTable('usuario', function (table) {
    table.boolean("recibeCorreoFacturaEntrante");
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('usuario', (table) => {
    table.dropColumn("recibeCorreoFacturaEntrante");
  });
};
