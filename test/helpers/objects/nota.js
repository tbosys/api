var Execute = require("../context");

module.exports = async function(type, body = {}) {
  var notaBody = {
    estado: "por aprobar",
    tipo: type,
    moneda: "CRC",
    tipoCambio: 1,
    clienteId: body.clienteId,
    descripcion: "test",
    totalComprobante: 33333,
    ...body
  };
  var nota = await Execute(notaBody, "nota", "create");
  await Execute({ ids: [nota.id] }, "nota", "aprobar");

  return nota;
};
