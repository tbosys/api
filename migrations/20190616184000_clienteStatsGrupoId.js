exports.up = function(knex, Promise) {
  return knex.schema.alterTable("clienteStats", function(table) {
    table.integer("clienteGrupoComercialId").unsigned();
    table
      .foreign("clienteGrupoComercialId")
      .references("id")
      .inTable("clienteGrupoComercial")
      .onDelete("RESTRICT");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("clienteStats", function(table) {
    table.dropForeign("clienteGrupoComercialId");
    table.dropColumn("clienteGrupoComercialId");
  });
};
