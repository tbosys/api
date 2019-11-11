exports.up = function (knex, Promise) {
    return knex.schema.alterTable('firmaDigital', function (table) {
      table.string("channelSlackFacturacion");
      table.string("channelSlackRecibo");
    })
  };
  
  exports.down = function (knex, Promise) {
    return knex.schema.alterTable('firmaDigital', (table) => {
      table.dropColumn("channelSlackFacturacion");
      table.dropColumn("channelSlackRecibo");
    });
  };
  