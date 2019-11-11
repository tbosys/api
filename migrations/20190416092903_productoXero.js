exports.up = function(knex, Promise) {
  return knex.schema
    .alterTable("producto", function(table) {
      table.string("xeroId");
    })
    .then(() => {
      return knex.schema.alterTable("cliente", function(table) {
        table.string("xeroId");
      });
    });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .alterTable("producto", function(table) {
      table.dropColumn("xeroId");
    })
    .then(() => {
      return knex.schema.alterTable("cliente", function(table) {
        table.dropColumn("xeroId");
      });
    });
};
