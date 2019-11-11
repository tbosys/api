exports.up = function(knex, Promise) {
    return knex.schema.alterTable("cliente", function(table) {
      table.string("cobroDia");
      table.integer("cobroEncargadoId").unsigned();
      table.foreign("cobroEncargadoId").references("id").inTable("cobroEncargado").onDelete("RESTRICT");
    });
  };

  exports.down = function(knex, Promise) {
    return knex.schema.alterTable("cliente", function(table) {
      table.dropColumn("cobroDia");
      table.dropForeign("cobroEncargadoId");
      table.dropColumn("cobroEncargadoId");
    });
  };