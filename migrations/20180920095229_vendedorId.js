exports.up = function (knex, Promise) {

  return knex.schema.alterTable('cliente', function (table) {
    table.integer("vendedorId").unsigned();
    table.foreign('vendedorId').references('id').inTable('vendedor').onDelete("RESTRICT");
  })
    .then(() => {
      return knex.schema.alterTable('documento', function (table) {
        table.integer("vendedorId").unsigned();
        table.foreign('vendedorId').references('id').inTable('vendedor').onDelete("RESTRICT");
      })
    })
    .then(() => {
      return knex.schema.alterTable('pagoDocumento', function (table) {
        table.integer("vendedorId").unsigned();
        table.foreign('vendedorId').references('id').inTable('vendedor').onDelete("RESTRICT");
      })
    })
    .then(() => {
      return knex.schema.alterTable('orden', function (table) {
        table.integer("vendedorId").unsigned();
        table.foreign('vendedorId').references('id').inTable('vendedor').onDelete("RESTRICT");
      })
    })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('cliente', function (table) {
    table.dropForeign('vendedorId');
    table.dropColumn("vendedorId");
  })
    .then(() => {
      return knex.schema.alterTable('documento', function (table) {
        table.dropForeign('vendedorId');
        table.dropColumn("vendedorId");
      })
    })
    .then(() => {
      return knex.schema.alterTable('pagoDocumento', function (table) {
        table.dropForeign('vendedorId');
        table.dropColumn("vendedorId");
      })
    })
    .then(() => {
      return knex.schema.alterTable('orden', function (table) {
        table.dropForeign('vendedorId');
        table.dropColumn("vendedorId");
      })
    })
};
