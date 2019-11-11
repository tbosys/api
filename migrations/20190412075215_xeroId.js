exports.up = function(knex, Promise) {
  return knex.schema
    .alterTable("lineaPagoDocumento", function(table) {
      table.string("xeroId");
    })
    .then(() => {
      return knex.schema.alterTable("documento", function(table) {
        table.string("xeroId");
      });
    })
    .then(() => {
      return knex.schema.alterTable("facturaCxP", function(table) {
        table.string("xeroId");
      });
    })
    .then(() => {
      return knex.schema.alterTable("boleta", function(table) {
        table.string("xeroId");
      });
    });
};

exports.down = function(knex, Promise) {
  return knex.schema
    .alterTable("lineaPagoDocumento", function(table) {
      table.dropColumn("xeroId");
    })
    .then(() => {
      return knex.schema.alterTable("documento", function(table) {
        table.dropColumn("xeroId");
      });
    })
    .then(() => {
      return knex.schema.alterTable("facturaCxP", function(table) {
        table.dropColumn("xeroId");
      });
    })
    .then(() => {
      return knex.schema.alterTable("boleta", function(table) {
        table.dropColumn("xeroId");
      });
    });
};
