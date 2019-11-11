exports.up = function(knex, Promise) {
  return knex.schema.alterTable("registroRecibido", function(table) {
    table.decimal("impuesto", 12, 5);
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("registroRecibido", function(table) {
    table.dropColumn("impuesto");
  });
};
