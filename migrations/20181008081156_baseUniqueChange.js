
exports.up = async function(knex, Promise) {

    await knex.schema.alterTable('usuario', function (table) {
        table.unique(['email', 'namespaceId'], "usuario2")
    })

    await knex.schema.alterTable('cliente', function (table) {
        table.unique(['name', 'namespaceId'], "cliente_unique2")
    })

    await knex.schema.alterTable('producto', function (table) {
        table.unique(['name', 'namespaceId'], "producto2")
    })

    await knex.schema.alterTable('contacto', function (table) {
        table.unique(['name', 'clienteId', 'namespaceId'], "contacto2")
    })

    await knex.schema.alterTable('proveedor', function (table) {
        table.unique(['name', 'namespaceId'], "proveedor2")
    })

};

exports.down = async function(knex, Promise) {

    await knex.schema.alterTable('usuario', function (table) {
        table.dropUnique(['email', 'namespaceId'], "usuario2")
    })

    await knex.schema.alterTable('cliente', function (table) {
        table.dropUnique(['email', 'namespaceId'], "cliente_unique2")
    })

    await knex.schema.alterTable('producto', function (table) {
        table.dropUnique(['name', 'namespaceId'], "producto2")
    })

    await knex.schema.alterTable('contacto', function (table) {
        table.dropUnique(['name', 'clienteId', 'namespaceId'], "contacto2")
    })

    await knex.schema.alterTable('proveedor', function (table) {
        table.dropUnique(['name', 'namespaceId'], "proveedor2")
    })

};
