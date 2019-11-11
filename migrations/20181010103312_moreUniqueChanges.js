
exports.up = async function(knex, Promise) {
    await knex.schema.alterTable('facturaCxP', function (table) {
        table.unique(['referencia', 'proveedorId', 'namespaceId'], "fcxp2")
    })

    await knex.schema.alterTable('pagoCxP', function (table) {
        table.unique(['referencia','facturaCxPId', 'namespaceId'], "pagocp2")
    })
 
    await knex.schema.alterTable('orden', function (table) {
        table.unique(['name', 'clienteId', 'namespaceId'], "orden2")
    })

    await knex.schema.alterTable('documento', function (table) {
        table.unique(['consecutivo', 'tipo', 'namespaceId'], "documento2")
    })

    await knex.schema.alterTable('boleta', function (table) {
        table.unique(['tipo', 'referencia', 'namespaceId'], "boleta2")
    })

};

exports.down = async function(knex, Promise) {

    await knex.schema.alterTable('facturaCxP', function (table) {
        table.dropUnique(['referencia', 'proveedorId', 'namespaceId'], "fcxp2")
    })

    await knex.schema.alterTable('pagoCxP', function (table) {
        table.dropUnique(['referencia','facturaCxPId', 'namespaceId'], "pagocp2")
    })
    
    await knex.schema.alterTable('orden', function (table) {
        table.dropUnique(['name', 'clienteId', 'namespaceId'], "orden2")
    })

    await knex.schema.alterTable('documento', function (table) {
        table.dropUnique(['consecutivo', 'tipo', 'namespaceId'], "documento2")
    })

    await knex.schema.alterTable('boleta', function (table) {
        table.dropUnique(['tipo', 'referencia', 'namespaceId'], "boleta2")
    })

};
