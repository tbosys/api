exports.up = function(knex, Promise) {
  return knex.schema
    .alterTable("registroRecibido", function(table) {
      table.boolean("noDeducible");
    })
    .then(() => {
      return knex.schema.alterTable("gasto", function(table) {
        table.boolean("noDeducible");
      });
    });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .alterTable("registroRecibido", function(table) {
      table.dropColumn("noDeducible");
    })
    .then(() => {
      return knex.schema.alterTable("gasto", function(table) {
        table.dropColumn("noDeducible");
      });
    });
};
