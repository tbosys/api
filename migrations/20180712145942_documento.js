exports.up = function (knex, Promise) {
  return knex.schema.createTable('documento', function (table) {
    table.increments();
    table.string("createdBy");
    table.string("updatedBy");
    table.timestamp("createdAt").defaultTo(knex.fn.now());
    table.timestamp("updatedAt").defaultTo(knex.fn.now());
    table.string("namespaceId", 20).notNull();
    table.string("consecutivo", 51);
    table.date("fecha");
    table.string("fechaISO", 51);
    table.string("clave").notNull();
    table.string("facturaUrl");
    table.json("emisor").notNull();
    table.json("receptor");
    table.json("informacionReferencia");
    table.string("condicionVenta", 2).notNull();
    table.string("medioPago", 2).notNull();
    table.string("moneda", 3).defaultTo("CRC").notNull();
    table.decimal("tipoCambio", 15, 5);
    table.decimal("totalServGravados", 18, 5);
    table.decimal("totalServExcentos", 15, 5);
    table.decimal("totalMercanciasGravadas", 15, 5);
    table.decimal("totalMercanciasExcentas", 15, 5);
    table.decimal("totalGravado", 15, 5);
    table.decimal("totalExcento", 15, 5);
    table.decimal("totalVenta", 15, 5);
    table.decimal("totalDescuentos", 15, 5);
    table.decimal("totalVentaNeta", 15, 5);
    table.decimal("totalImpuesto", 15, 5);
    table.decimal("totalComprobante", 15, 5);
    table.json("normativa");

    table.string("name");

    table.string("estado");
    table.string("tipo", 10);

    table.text("descripcion");
    table.integer("plazo");
    table.string("referencia", 25);

    table.decimal("saldo", 15, 5);
    table.string("approveBy");
    table.string("approveByExternalId");


    table.string("externalId");
    table.string("clienteExternalId");
    table.string("ownerExternalId");
    table.string("ordenExternalId");
    table.string("respuesta", "longtext");

    table.integer("ordenId").unsigned();
    table.foreign('ordenId').references('id').inTable('orden').onDelete("RESTRICT");

    table.integer("promocionId").unsigned();
    table.foreign('promocionId').references('id').inTable('promocion').onDelete("RESTRICT");

    table.integer("clienteId").unsigned();
    table.foreign('clienteId').references('id').inTable('cliente').onDelete("RESTRICT");

    table.integer("transporteId").unsigned();
    table.foreign('transporteId').references('id').inTable('transporte').onDelete("RESTRICT");

    table.integer("ownerId").unsigned();
    table.foreign('ownerId').references('id').inTable('usuario').onDelete("RESTRICT");

    table.string("ownerName");
    table.string("vendedorName");

    table.unique(['consecutivo', 'tipo','externalId', 'namespaceId'], "documeto")
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('documento');
};
