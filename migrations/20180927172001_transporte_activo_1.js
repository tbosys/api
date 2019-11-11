exports.up = async function (knex, Promise) {
    await knex.schema.alterTable('transporte', function (table) {
        table.dropColumn("activo");
    })
    await knex.schema.alterTable('transporte', function (table) {
        table.boolean("activo").default(1);
    })
  };
  
  exports.down = function (knex, Promise) {
    return knex.schema.alterTable('transporte', (table) => {
        table.dropColumn("activo");
    });
  };
  