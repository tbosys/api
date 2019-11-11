var Execute = require("../context");
var Query = require("../query");

module.exports = async function(clienteId) {
  var pago = await Query.byFiltersOne([["pagoDocumento.clienteId", "=", clienteId]], "pagoDocumento");

  let pagoDevolver = await Execute({ ids: [pago.id] }, "pagoDocumento", "revertir");

  await Execute({ ids: [pagoDevolver.id] }, "pagoDocumento", "aplicar");
  pagoDevolver = await Query.byId("pagoDocumento", pagoDevolver.id);
  return { original: pago, devuelto: pagoDevolver };
};
