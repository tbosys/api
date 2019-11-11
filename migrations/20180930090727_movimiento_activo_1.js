exports.up = async function (knex, Promise) {
    await knex.schema.alterTable('movimientoInventario', function (table) {
        table.boolean("activo").default(1);
    })
};

exports.down = function (knex, Promise) {
    return knex.schema.alterTable('movimientoInventario', (table) => {
        table.dropColumn("activo");
    });
};
