var Execute = require("../context");

module.exports = function(body = {}) {
  var contacto = {
    cedula: "100000000",
    name: "contactoTest",
    activo: true,
    mobile: "88887777",
    rol: "mixto",
    ...body
  };
  return Execute(contacto, "contacto", "create");
};
