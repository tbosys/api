exports.up = function (knex, Promise) {
  return knex.schema.createTable('cliente', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.boolean("activo");
    table.string("name").notNull();
    table.string("nombreComercial");
    table.string("cedula", 25);
    table.string("correoDocumentosElectronicos");
    table.text("descripcion");

    table.text("direccion");
    table.string("telefono");
    table.string("sitioWeb");
    table.string("tipoPrecio").defaultTo("retail");

    table.boolean("aprobacionManual");
    table.integer("creditoPlazo");
    table.decimal("creditoLimite", 15, 5);
    table.string("encargadoVentas");
    table.string("encargadoCredito");

    table.string("formaEntrega");
    table.string("posicionGPS");

    table.json("ubicacion");

    table.string("externalId");
    table.string("distritoName");
    table.string("grupoName");
    table.string("zonaName");

    table.integer("transporteId").unsigned();
    table.foreign('transporteId').references('id').inTable('transporte').onDelete("RESTRICT");

    table.integer("grupoId").unsigned();
    table.foreign('grupoId').references('id').inTable('grupo').onDelete("RESTRICT");

    table.integer("segmentoId").unsigned();
    table.foreign('segmentoId').references('id').inTable('segmento').onDelete("RESTRICT");

    table.integer("zonaId").unsigned();
    table.foreign('zonaId').references('id').inTable('zona').onDelete("RESTRICT");

    table.integer("distritoId").unsigned();
    table.foreign('distritoId').references('id').inTable('distrito').onDelete("RESTRICT");

    table.integer("ownerId").unsigned();
    table.foreign('ownerId').references('id').inTable('usuario').onDelete("RESTRICT");

    table.string("ownerName");
    table.string("ownerExternalId");
    table.string("vendedorExternalId");

    table.unique(['name','externalId', 'namespaceId'], "cliente_unique")
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('cliente');
};
