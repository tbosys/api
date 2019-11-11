const Dinero = require("dinero.js");
Dinero.globalLocale = "es-CR";
Dinero.defaultPrecision = 5;
var setPrecioAndDescuento = require("./setPrecioAndDescuento");
var Errors = require("../../../errors");

const _setImpuestos = (linea, excentoPorcentaje = 0) => {
  if (excentoPorcentaje) linea.excentoPorcentaje = parseFloat(excentoPorcentaje);
  else linea.excentoPorcentaje = 0;

  linea._impuestoUnitario = linea._impuestoUnitario
    ? parseInt(linea._impuestoUnitario)
    : parseInt(linea.impuestoUnitario); //reset impuesto unitario

  excentoPorcentaje = new Dinero({ amount: parseInt((linea.excentoPorcentaje || 0) * 100000) }); //excentoPorcentaje for Dinero
  var impuestoUnitarioPercent = Dinero({ amount: 100 * 100000 })
    .subtract(excentoPorcentaje)
    .toRoundedUnit(2); // impuesto unitario 100 - Excento

  linea._excentoUnitario = Dinero({ amount: parseInt(linea._impuestoUnitario) * 100000 })
    .percentage(linea.excentoPorcentaje || 0)
    .toRoundedUnit(2);
  linea.impuestoUnitario = Dinero({ amount: parseInt(linea._impuestoUnitario) * 100000 })
    .percentage(impuestoUnitarioPercent)
    .toRoundedUnit(2);
};

const validateProductoAndLinea = (linea, producto) => {
  if (!linea.descuentoUnitario) linea.descuentoUnitario = 0;

  if ((!producto.impuesto && producto.impuesto != 0) || producto.impuesto >= 0 != true)
    throw new Errors.VALIDATION_ERROR("El producto " + producto.name + " no tiene impuesto");
  if (!linea.precio || linea.precio <= 0)
    throw new Errors.VALIDATION_ERROR("El producto " + producto.name + " no tiene precio");
  if (!linea.cantidad || linea.cantidad <= 0)
    throw new Errors.VALIDATION_ERROR("El producto " + producto.name + " no tiene cantidad");
  if (linea.descuentoUnitario < 0)
    throw new Errors.VALIDATION_ERROR("El producto " + producto.name + " no tiene descuento");
};

module.exports = function calculateOrdenLinea(linea, productoMap, cliente, excentoPorcentaje) {
  var producto = productoMap[linea.productoId];
  validateProductoAndLinea(linea, producto);

  linea.impuestoUnitario = producto.impuesto;
  linea._impuestoUnitario = producto.impuesto;
  _setImpuestos(linea, excentoPorcentaje);

  const _subTotal = Dinero({ amount: parseInt(linea.precio * 100000) }).multiply(
    parseFloat(linea.cantidad || 0)
  );
  const _descuento = _subTotal.percentage(linea.descuentoUnitario || 0);
  const _subTotalConDescuento = _subTotal.subtract(_descuento);
  const _impuesto = _subTotalConDescuento.percentage(linea.impuestoUnitario, "HALF_UP");
  const _excento = _subTotalConDescuento.percentage(linea._excentoUnitario || 0, "HALF_UP");
  const _total = _subTotal.subtract(_descuento).add(_impuesto);

  var precioData = setPrecioAndDescuento(cliente, producto);

  return {
    ...linea,
    _negociado: linea.precio > precioData.precio || linea.descuentoUnitario > precioData.descuentoUnitario,
    mercancia: producto.mercancia == null ? 1 : producto.mercancia,
    medida: producto.unidadMedida || "Kg",
    codigo: producto.codigo || "2",
    _productoId: producto.name || "Producto 1",
    detalle: producto.name || "Producto 1",
    productoId: producto.id,
    naturalezaDescuento: linea.descuentoUnitario && linea.descuentoUnitario > 0 ? "cliente frecuente" : null,
    subTotal: _subTotal.toRoundedUnit(5),
    subTotalConDescuento: _subTotalConDescuento.toRoundedUnit(5),
    total: _total.toRoundedUnit(5),
    impuesto: _impuesto.toRoundedUnit(5),
    excento: _excento.toRoundedUnit(5),
    descuento: _descuento.toRoundedUnit(5)
  };
};
