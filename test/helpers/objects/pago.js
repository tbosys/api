var Execute = require("../context");
var Query = require("../query");

module.exports = async function(body = {}, documentos = []) {
  var pagoBody = {
    moneda: "CRC",
    formaPago: "transferencia",
    tipoCambio: 1,
    clienteId: body.clienteId,
    lineaPagoDocumento: documentos.map(documento => {
      return {
        _saldoId: documento._saldoId,
        documentoId: documento.id,
        monto: documento.monto
      };
    }),
    referencia: "sdsd",
    ...body
  };
  var pago = await Execute(pagoBody, "pagoDocumento", "create");
  await Execute({ ids: [pago.id] }, "pagoDocumento", "aplicar");
  pago = await Query.byId("pagoDocumento", pago.id);

  return pago;
};
