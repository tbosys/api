var Execute = require("../context");
var Query = require("../query");
var moment = require("moment");

module.exports = async function(body = {}, productos = []) {
  var ordenBody = {
    tipo: "pedido",
    fuente: "ventas",
    autoAplicar: true,
    moneda: "CRC",
    tipoCambio: 1,
    cedula: "3101023455",
    transporteId: 1,
    clienteId: body.clienteId,
    plazo: 30,
    ordenLinea: JSON.stringify(
      productos.map(producto => ({
        precio: producto.precio || 1,
        descuentoUnitario: producto.descuento || 0,
        cantidad: producto.cantidad || 1,
        productoId: producto.id,
        especial: producto.especial || false,
        excentoPorcentaje: producto.excentoPorcentaje || 0,
        _excentoUnitario: producto.excentoUnitario || 0
      }))
    ),
    fecha: moment().format("YYYY-MM-DD"),
    ...body
  };
  return Execute(ordenBody, "orden", "create");
};
