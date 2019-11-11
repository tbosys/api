exports.up = function(knex, Promise) {
  return knex.schema
    .alterTable("productoDepartamento", function(table) {
      table.integer("orden");
    })
    .then(() => {
      return knex.schema.alterTable("productoCategoria", function(table) {
        table.integer("orden");
      });
    })
    .then(() => {
      return knex.schema.alterTable("productoGrupo", function(table) {
        table.integer("orden");
      });
    });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .alterTable("productoDepartamento", function(table) {
      table.dropColumn("orden");
    })
    .then(() => {
      return knex.schema.alterTable("productoCategoria", function(table) {
        table.dropColumn("orden");
      });
    })
    .then(() => {
      return knex.schema.alterTable("productoGrupo", function(table) {
        table.dropColumn("orden");
      });
    });
};
