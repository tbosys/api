var Execute = require("../context");

module.exports = function(body = {}) {
  var cliente = {
    cedula: "3101023455",
    name: "credito",
    activo: true,
    creditoPlazo: 30,
    creditoLimite: 1000000,
    ...body
  };
  return Execute(cliente, "cliente", "create");
};
