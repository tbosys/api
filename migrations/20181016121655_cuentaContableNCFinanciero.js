exports.up = function (knex, Promise) {
    return knex.schema.alterTable('firmaDigital', function (table) {
      table.string("cuentaContableNcFinanciero");
    })
  };
  
  exports.down = function (knex, Promise) {
    return knex.schema.alterTable('firmaDigital', (table) => {
      table.dropColumn("cuentaContableNcFinanciero");
    });
  };
  