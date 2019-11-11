const Dinero = require("dinero.js");
Dinero.globalLocale = "es-CR";
Dinero.defaultPrecision = 5;
var Errors = require("../../../errors");

var calculateOrdenLinea = require("./calculateOrdenLinea");

module.exports = async function setPrecioAndDescuento(orden, getActionAndInvoke, cliente) {
  var ordenLineaString = orden.ordenLinea;
  var excentoPorcentaje = orden.excentoPorcentaje || 0;
  if (excentoPorcentaje < 0 || excentoPorcentaje > 100)
    throw new Errors.VALIDATION_ERROR("El monto excento no puede ser menor a 0 ni mayor a 100");

  var lineas = JSON.parse(ordenLineaString);
  if (lineas.length == 0) throw new Errors.VALIDATION_ERROR("La orden tiene que tener lineas.");
  var productos = [];
  var productoIds = [];
  lineas.forEach(linea => {
    productoIds.push(linea.productoId);
  });
  productos = await getActionAndInvoke("producto", "forTablet", { ids: productoIds });

  var productoMap = {};
  productos.forEach(producto => {
    productoMap[producto.id] = producto;
  });

  let subTotal = 0;
  let descuento = 0;
  let subTotalConDescuento = 0;
  let impuesto = 0;
  let excento = 0;
  let total = 0;
  let especial = false;
  let negociado = false;
  var ordenLineas = lineas.map(linea => {
    delete linea.producto;
    var ordenLinea = calculateOrdenLinea(linea, productoMap, cliente, excentoPorcentaje);
    if (ordenLinea.especial) especial = true;
    else if (ordenLinea._negociado) negociado = true;
    subTotal = Number.dineroNumber(subTotal, ordenLinea.subTotal, "plus");
    subTotalConDescuento = Number.dineroNumber(subTotalConDescuento, ordenLinea.subTotalConDescuento, "plus");
    descuento = Number.dineroNumber(descuento, ordenLinea.descuento, "plus");
    impuesto = Number.dineroNumber(impuesto, ordenLinea.impuesto, "plus");
    excento = Number.dineroNumber(excento, ordenLinea.excento, "plus");
    total = Number.dineroNumber(total, ordenLinea.total, "plus");
    return ordenLinea;
  });

  return {
    especial,
    negociado,
    subTotal,
    total,
    impuesto,
    excento,
    subTotalConDescuento,
    descuento,
    descripcion: excentoPorcentaje ? "**Exonerado IVA** " + orden.descripcion : orden.descripcion,
    ordenLinea: JSON.stringify(ordenLineas)
  };
};
