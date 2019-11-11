exports.up = function(knex, Promise) {
  var tables = [
    "account",
    "ajusteCierre",
    "atributoProducto",
    "bank",
    "boleta",
    "categoria",
    "cheque",
    "cierre",
    "cliente",
    "clienteSegmento",
    "code",
    "comisionHistorico",
    "code",
    "contabilidadHistorico",
    "contacto",
    "costoHistorico",
    "descuentoCliente",
    "descuentoGrupo",
    "descuentoPromocion",
    "despacho",
    "distrito",
    "documento",
    "emailRecord",
    "envio",
    "evento",
    "facturaCxP",
    "firmaDigital",
    "gasto",
    "grupo",
    "inventarioHistorico",
    "journal",
    "journalItem",
    "lineaPagoCxP",
    "lineaPagoDocumento",
    "listaEmpaque",
    "log",
    "meta",
    "movimientoInventario",
    "nota",
    "orden",
    "ordenLinea",
    "pagoCxP",
    "pagoDocumento",
    "precio",
    "producto",
    "promocion",
    "proveedor",
    "proveedorContacto",
    "registro",
    "registroContinuo",
    "registroCuentaContable",
    "registroCuentaContableDetail",
    "registroElectronico",
    "registroGeneral",
    "registroRecibido",
    "rol",
    "saldo",
    "segmento",
    "transporte",
    "transporteContacto",
    "usuario",
    "vendedor",
    "zona"
  ];

  var promises = tables.map(table => {
    return knex.schema.alterTable(table, function(table) {
      table
        .string("namespaceId")
        .alter()
        .nullable();
    });
  });
  return Promise.all(promises);
};

exports.down = function(knex, Promise) {
  return Promise.resolve({});
};
