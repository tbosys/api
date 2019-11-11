exports.up = function (knex, Promise) {
    return knex.schema.alterTable('pagoCxP', function (table) {
        table.date("fecha");
    })
  };
  
  exports.down = function (knex, Promise) {
    return knex.schema.alterTable('pagoCxP', (table) => {
        table.dropColumn("fecha");
    });
  };
  