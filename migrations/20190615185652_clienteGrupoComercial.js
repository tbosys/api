exports.up = function(knex, Promise) {
  return knex.schema
    .createTable("clienteGrupoComercial", function(table) {
      table.increments();
      table.string("name");
      table.string("descripcion");

      table.string("createdBy");
      table.string("updatedBy");

      table.timestamp("createdAt").defaultTo(knex.fn.now());
      table.timestamp("updatedAt").defaultTo(knex.fn.now());
    })
    .then(() => {
      return knex.schema.alterTable("cliente", function(table) {
        table.integer("clienteGrupoComercialId").unsigned();
        table
          .foreign("clienteGrupoComercialId")
          .references("id")
          .inTable("clienteGrupoComercial")
          .onDelete("RESTRICT");
      });
    });
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable("clienteGrupoComercial").then(() => {
    return knex.schema.alterTable("cliente", function(table) {
      table.dropForeign("clienteGrupoComercialId");
      table.dropColumn("clienteGrupoComercialId");
    });
  });
};
