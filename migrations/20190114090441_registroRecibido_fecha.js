exports.up = function(knex, Promise) {
  return knex.schema.alterTable("registroRecibido", function(table) {
    table.date("fecha");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("registroRecibido", function(table) {
    table.dropColumn("fecha");
  });
};
