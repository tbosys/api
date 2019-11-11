var Execute = require("../context");

module.exports = function(body = {}) {
  var producto = {
    activo: true,
    unidadMedida: "kg",
    name: "Producto 1",
    grupoProductoId: 1,
    inventario: 0,
    mercancia: true,
    codigo: "2",
    porcentajeComision: 1,
    impuesto: 13,
    ...body
  };
  return Execute(producto, "producto", "create");
};
