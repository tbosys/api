exports.up = function(knex, Promise) {
  return knex.schema.alterTable("registroRecibido", function(table) {
    table.string("moneda");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("registroRecibido", function(table) {
    table.dropColumn("moneda");
  });
};
