exports.up = function(knex, Promise) {
  return knex.schema
    .alterTable("productoGrupo", function(table) {
      table.string("tipos");
    })
    .then(() => {
      return knex.schema.alterTable("productoCategoria", function(table) {
        table.unique("name");
      });
    });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .alterTable("productoGrupo", function(table) {
      table.dropColumn("tipos");
    })
    .then(() => {
      return knex.schema.alterTable("productoCategoria", function(table) {
        table.dropUnique("name");
      });
    });
};
