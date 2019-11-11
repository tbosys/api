var Execute = require("../context");
var Query = require("../query");

module.exports = async function(orden) {
  var ordenCheck = await Query.byId("orden", orden.id);

  if (ordenCheck.estado == "por activar") {
    await Execute({ ids: [orden.id] }, "orden", "activar");
    ordenCheck = await Query.byId("orden", orden.id);
  }

  if (ordenCheck.estado == "por aprobar") {
    await Execute({ ids: [orden.id] }, "orden", "aprobar");
    ordenCheck = await Query.byId("orden", orden.id);
  }
  if (ordenCheck.estado == "por imprimir") {
    await Execute({ ids: [orden.id] }, "orden", "imprimir");
  }
  return Query.byId("orden", orden.id);
};
