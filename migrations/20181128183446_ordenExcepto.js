exports.up = function (knex, Promise) {
  return knex.schema.alterTable('orden', function (table) {
    table.string("excentoTipo");
    table.string("excentoNumero");
    table.string("excentoInstitucion");
    table.date("excentoFecha");
    table.decimal("excento", 17, 5);
    table.decimal("excentoPorcentaje", 5, 2);
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.alterTable('orden', (table) => {
    table.dropColumn("excentoTipo");
    table.dropColumn("excentoNumero");
    table.dropColumn("excentoInstitucion");
    table.dropColumn("excentoFecha");
    table.dropColumn("excento");
    table.dropColumn("excentoPorcentaje");
  });
};
