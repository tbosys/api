exports.up = function(knex, Promise) {
  return knex.schema
    .alterTable("orden", function(table) {
      table.string("ordenTags");
    })
    .then(() => {
      return knex.schema.alterTable("documento", function(table) {
        table.string("documentoTags");
      });
    })
    .then(() => {
      return knex.schema.alterTable("movimientoInventario", function(table) {
        table.string("documentoTags");
      });
    });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .alterTable("orden", function(table) {
      table.dropColumn("ordenTags");
    })
    .then(() => {
      return knex.schema.alterTable("documento", function(table) {
        table.dropColumn("documentoTags");
      });
    })
    .then(() => {
      return knex.schema.alterTable("movimientoInventario", function(table) {
        table.dropColumn("documentoTags");
      });
    });
};
