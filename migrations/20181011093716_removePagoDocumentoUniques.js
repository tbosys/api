
exports.up = function(knex, Promise) {
    
    return knex.schema.alterTable('pagoDocumento', function (table) {
        table.dropUnique(['recibo', 'externalId', 'referencia', 'namespaceId'], "pagodoc")
    })

};

exports.down = function(knex, Promise) {

    return knex.schema.alterTable('pagoDocumento', function (table) {
        table.unique(['recibo', 'externalId', 'referencia', 'namespaceId'], "pagodoc")
    })  
  
};
