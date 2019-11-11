exports.up = function(knex, Promise) {
  return knex.schema.alterTable("registroRecibido", function(table) {
    table.decimal("totalComprobante", 12, 5);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("registroRecibido", function(table) {
    table.dropColumn("totalComprobante");
  });
};
