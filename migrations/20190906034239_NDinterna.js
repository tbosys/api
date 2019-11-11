exports.up = function(knex, Promise) {
  return knex.schema
    .alterTable("documento", function(table) {
      table.boolean("documentoInterno");
    })
    .then(() => {
      return knex.schema.alterTable("nota", function(table) {
        table.boolean("documentoInterno");
      });
    });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .alterTable("documento", function(table) {
      table.dropColumn("documentoInterno");
    })
    .then(() => {
      return knex.schema.alterTable("nota", function(table) {
        table.dropColumn("documentoInterno");
      });
    });
};
