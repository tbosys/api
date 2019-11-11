exports.up = function (knex, Promise) {
    return knex.schema.alterTable('facturaCxP', function (table) {
        table.date("fechaIngreso");
    })
  };
  
  exports.down = function (knex, Promise) {
    return knex.schema.alterTable('facturaCxP', (table) => {
        table.dropColumn("fechaIngreso");
    });
  };
  