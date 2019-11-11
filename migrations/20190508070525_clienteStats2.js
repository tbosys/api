exports.up = function(knex, Promise) {
  return knex.schema.alterTable("clienteStats", function(table) {
    table.string("name");
    table.string("tags");
    table.integer("creditoPlazo");
    table.decimal("creditoLimite", 18, 5);

    table.decimal("metaCompra");
    table.integer("metaPlazoPago");
    table.integer("indiceCompraG1");
    table.integer("indiceCompraG2");
    table.integer("indiceCompraG3");

    table.integer("segmentoId").unsigned();
    table
      .foreign("segmentoId")
      .references("id")
      .inTable("segmento")
      .onDelete("RESTRICT");

    table.integer("zonaId").unsigned();
    table
      .foreign("zonaId")
      .references("id")
      .inTable("zona")
      .onDelete("RESTRICT");

    table.integer("distritoId").unsigned();
    table
      .foreign("distritoId")
      .references("id")
      .inTable("distrito")
      .onDelete("RESTRICT");

    table.integer("ownerId");
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.alterTable("clienteStats", function(table) {
    table.dropColumn("name");
    table.dropColumn("tags");
    table.dropColumn("creditoPlazo");
    table.dropColumn("creditoLimite");

    table.dropColumn("metaCompra");
    table.dropColumn("metaPlazoPago");
    table.dropColumn("indiceCompraG1");
    table.dropColumn("indiceCompraG2");
    table.dropColumn("indiceCompraG3");

    table.dropForeign("segmentoId");

    table.dropForeign("distritoId");

    table.dropForeign("zonaId");

    table.dropColumn("segmentoId");

    table.dropColumn("zonaId");

    table.dropColumn("distritoId");

    table.dropColumn("ownerId");
  });
};
