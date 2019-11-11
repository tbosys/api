exports.up = function(knex, Promise) {
    return knex.schema
      .alterTable("registroRecibido", function(table) {
        table.decimal("totalComprobante", 15, 5).alter();
      })
  };
  
  exports.down = function(knex, Promise) {
    return knex.schema.alterTable("registroRecibido", function(table) {
    });
  };
  