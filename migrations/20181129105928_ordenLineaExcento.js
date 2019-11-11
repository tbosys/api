exports.up = function (knex, Promise) {
  return knex.schema.alterTable('ordenLinea', function (table) {
    table.decimal("excento", 17, 5);
    table.decimal("excentoPorcentaje", 17, 5);
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('ordenLinea', (table) => {
    table.dropColumn("excento");
    table.dropColumn("excentoPorcentaje");
  });
};
