module.export = function(documento, lineas) {
  let totalServGravados = 0;
  let totalServExcentos = 0;
  let totalMercanciasGravadas = 0;
  let totalMercanciasExcentas = 0;
  let totalVenta = 0;
  let totalDescuentos = 0;
  let totalVentaNeta = 0;
  let totalImpuesto = 0;
  let totalComprobante = 0;
  const config = { maxDecimal: 5 };

  lineas.forEach(linea => {
    const _subTotal = exactMath.mul(linea.precio, linea.cantidad, config);
    const _descuento = exactMath.formula(`${_subTotal}*(${linea.descuentoUnitario || 0}/100)`, config);
    const _subTotalConDescuento = exactMath.sub(_subTotal, _descuento, config);
    const _impuesto = exactMath.formula(
      `${_subTotalConDescuento}*(${(linea.impuestoUnitario || 0) / 100})`,
      config
    );

    let gravado = 0;
    let exento = 0;
    if (_impuesto === 0) exento = _subTotal;
    else gravado = _subTotal;

    if (linea.mercancia) {
      totalMercanciasExcentas = exactMath.add(totalMercanciasExcentas, exento, config);
      totalMercanciasGravadas = exactMath.add(totalMercanciasGravadas, gravado, config);
    } else {
      totalServExcentos = exactMath.add(totalServExcentos, exento, config);
      totalServGravados = exactMath.add(totalServGravados, gravado, config);
    }

    totalVenta = exactMath.add(totalVenta, _subTotal, config);
    totalImpuesto = exactMath.add(totalImpuesto, _impuesto, config);
    totalDescuentos = exactMath.add(totalDescuentos, _descuento, config);
    totalVentaNeta = exactMath.add(totalVentaNeta, _subTotalConDescuento, config);
    totalComprobante = exactMath.add(totalComprobante, _subTotalConDescuento, _impuesto, config);
  });

  var result = {
    totalServGravados: totalServGravados,
    totalServExcentos: totalServExcentos,
    totalServExonerado: 0,
    totalMercExonerada: 0,
    totalExonerado: 0,
    totalMercanciasGravadas: totalMercanciasGravadas,
    totalMercanciasExcentas: totalMercanciasExcentas,
    totalGravado: exactMath.add(totalMercanciasGravadas, totalServGravados, config),
    totalExcento: exactMath.add(totalMercanciasExcentas, totalServExcentos, config),
    totalVenta: totalVenta,
    totalDescuentos: totalDescuentos,
    totalVentaNeta: totalVentaNeta,
    totalImpuesto: totalImpuesto,
    totalComprobante: totalComprobante
  };

  return { ...documento, ...result };
};
