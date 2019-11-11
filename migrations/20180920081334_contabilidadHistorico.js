exports.up = function (knex, Promise) {
  return knex.schema.createTable('contabilidadHistorico', function (table) {
    table.increments();
    table.timestamp("updatedAt").defaultTo(knex.fn.now());

    table.string("namespaceId", 20).notNull();
    table.date("fecha");

    table.decimal("valorInventarios", 18, 5);
    table.decimal("valorSaldosDocumento", 18, 5);
    table.decimal("valorSaldosCxP", 18, 5);

    table.decimal("FacturasCxpTotal", 18, 5);

    table.decimal("PagosCxPTotal", 18, 5);
    table.decimal("PagosDocumentoTotal", 18, 5);

    table.decimal("documentoFacturasContadoNeto", 18, 5);
    table.decimal("documentoFacturasCreditoNeto", 18, 5);
    table.decimal("documentoNotasCreditoNeto", 18, 5);
    table.decimal("documentoNotasDebitoNeto", 18, 5);

    table.decimal("documentoFacturasContadoGravado", 18, 5);
    table.decimal("documentoFacturasCreditoGravado", 18, 5);
    table.decimal("documentoNotasCreditoGravado", 18, 5);
    table.decimal("documentoNotasDebitoGravado", 18, 5);

    table.decimal("documentoFacturasContadoExento", 18, 5);
    table.decimal("documentoFacturasCreditoExento", 18, 5);
    table.decimal("documentoNotasCreditoExento", 18, 5);
    table.decimal("documentoNotasDebitoExento", 18, 5);

    table.decimal("documentoFacturasContadoImpuesto", 18, 5);
    table.decimal("documentoFacturasCreditoImpuesto", 18, 5);
    table.decimal("documentoNotasCreditoImpuesto", 18, 5);
    table.decimal("documentoNotasDebitoImpuesto", 18, 5);

    table.decimal("documentoFacturasContadoDescuento", 18, 5);
    table.decimal("documentoFacturasCreditoDescuento", 18, 5);
    table.decimal("documentoNotasCreditoDescuento", 18, 5);
    table.decimal("documentoNotasDebitoDescuento", 18, 5);

    table.decimal("documentoFacturasContadoTotal", 18, 5);
    table.decimal("documentoFacturasCreditoTotal", 18, 5);
    table.decimal("documentoNotasCreditoTotal", 18, 5);
    table.decimal("documentoNotasDebitoTotal", 18, 5);

    table.decimal("inventarioCostoEntradas", 18, 5);
    table.decimal("inventarioCostoSalidas", 18, 5);
    table.decimal("inventarioCostoCompras", 18, 5);
    table.decimal("inventarioCostoNotasCredito", 18, 5);
    table.decimal("inventarioCostoNotasDebito", 18, 5);
    table.decimal("inventarioCostoFacturas", 18, 5);
    table.decimal("inventarioCostoTotal", 18, 5);

    table.decimal("totalGastos", 18, 5);
    table.decimal("totalImpuestoSaldos", 18, 5);

    table.unique(['fecha', 'namespaceId'])
  })
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTable('contabilidadHistorico');
};
