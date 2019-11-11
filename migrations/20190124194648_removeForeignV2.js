exports.up = function(knex, Promise) {
  return knex.schema
    .alterTable("registroRecibido", function(table) {
      table.dropForeign("ownerId");
    })
    .then(function() {
      return knex.schema.alterTable("nota", function(table) {
        table.dropForeign("ownerId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("vendedor", function(table) {
        table.dropForeign("usuarioId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("log", function(table) {
        table.dropForeign("usuarioId");
      });
    })
    .then(function() {
      return knex.schema.alterTable("code", function(table) {
        table.dropForeign("usuarioId");
      });
    });
};

exports.down = function(knex, Promise) {
  return Promise.resolve({});
};
