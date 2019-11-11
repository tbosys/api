var BaseAction = require("../../operation/baseAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var fs = require("fs");
var https = require("https");
var querystring = require("querystring");
var request = require("superagent");
var js2xmlparser = require("js2xmlparser");
var TipoCedula = require("../../apiHelpers/hacienda/tipoCedula");
var Resumen = require("../../apiHelpers/hacienda/resumen");
var InvokeSign = require("../../apiHelpers/invokeSign");
var moment = require("moment-timezone");
var CreateDocumento = require("./helpers/createDocumento");
const exactMath = require("exact-math");

class Facturar extends BaseAction {
  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.aplicar(table, body);
  }

  async aplicar(table, body) {
    let { orden, consecutivos } = body;

    let { documento, ordenLineas } = await this.createDocumentoFromOrden(orden, consecutivos);
    let documentoWithId = await this.getActionAndInvoke("documento", "create", documento);

    var clienteGrupo = await this.knex("cliente")
      .select("grupoId")
      .where("id", "=", documento.clienteId)
      .first();

    let movimientoPromises = this.movimientosFromLineas(
      orden,
      ordenLineas,
      documentoWithId,
      clienteGrupo
    ).map(movimiento => this.getActionAndInvoke("movimientoInventario", "create", movimiento));
    let movimientos = await Promise.all(movimientoPromises);

    await this.getActionAndInvoke("comisionHistorico", "fromFactura", {
      ownerId: orden.ownerId,
      movimientos: movimientos
    });

    if (orden.transporteId) {
      var despacho = this.createDespacho(orden, documentoWithId);
      await this.getActionAndInvoke("despacho", "create", despacho);
    }
    await Facturar.InvokeSign(this.createInvokeSign(orden, documento, this.context.config, this.user));

    return { documento: documentoWithId, movimientos, ordenLineas };
  }

  createDocumentoFromOrden(orden, consecutivos) {
    let ordenLineas = JSON.parse(orden.ordenLinea);

    var base = {
      ...orden,
      tipo: "FA",
      ordenId: orden.id,
      cedula: orden.cedula || orden.clienteCedula,
      negociado: orden.negociado
    };
    var documento = CreateDocumento(base, consecutivos, this.context.config);

    let documentoTotal = Facturar.OrdenTotal(documento, ordenLineas);

    return { documento: documentoTotal, ordenLineas: ordenLineas };
  }

  movimientosFromLineas(orden, ordenLineas, documento, clienteGrupo) {
    const config = { maxDecimal: 5 };
    const round = function(value) {
      return exactMath.round(value, -5);
    };
    return ordenLineas.map((linea, index) => {
      const _subTotal = round(exactMath.mul(linea.precio, linea.cantidad, config));

      const _descuento = round(
        exactMath.formula(`${_subTotal}*(${linea.descuentoUnitario || 0}/100)`, config)
      );
      const _subTotalConDescuento = round(exactMath.sub(_subTotal, _descuento, config));
      const _impuesto = round(
        exactMath.formula(`${_subTotalConDescuento}*(${(linea.impuestoUnitario || 0) / 100})`, config)
      );

      var movimiento = {
        plazo: orden.plazo,
        fechaISO: moment()
          .tz("America/Costa_Rica")
          .format(),
        cantidad: linea.cantidad,
        precio: linea.precio,
        subTotal: _subTotal,
        subTotalConDescuento: _subTotalConDescuento,
        impuesto: _impuesto,
        descuento: _descuento,
        total: linea.total,
        excento: linea.excento,
        impuestoUnitario: linea.impuestoUnitario,
        impuestoCodigoTarifa: linea.impuestoCodigoTarifa || "08",
        descuentoUnitario: linea.descuentoUnitario,
        medida: linea.medida || (linea.mercancia ? "Unid" : "Sp"),
        mercancia: linea.mercancia,
        codigo: JSON.stringify({
          Tipo: "04",
          Codigo: linea.codigo ? linea.codigo.substring(0, 20) : "000001"
        }),
        detalle: linea.detalle,
        productoId: linea.productoId,
        tipo: "FA",
        fecha: moment().format("YYYY-MM-DD"),
        numeroLinea: index + 1,
        naturalezaDescuento: linea.naturalezaDescuento,
        documentoId: documento.id,
        clienteId: documento.clienteId,
        grupoId: clienteGrupo.grupoId,
        ownerId: orden.ownerId,
        _vendedorId: orden.vendedorId,
        tipoNegociacion: linea.tipoNegociacion,
        tipoNegociacionMonto: linea.tipoNegociacionMonto
      };

      if (orden.excentoPorcentaje) {
        movimiento.exoneracion = JSON.stringify({
          TipoDocumento: orden.excentoTipo,
          NumeroDocumento: orden.excentoNumero,
          NombreInstitucion: orden.excentoInstitucion,
          FechaEmision: moment(orden.excentoFecha).format("YYYY-MM-DDT13:00:00+06:00"),
          PorcentajeExoneracion: orden.excentoPorcentaje,
          MontoExoneracion: linea.excento,
          ImpuestoNeto: linea.impuestoUnitario - orden.excentoPorcentaje / 100
        });
      }

      return movimiento;
    });
  }

  createDespacho(orden, documento) {
    return {
      estado: "por alistar",
      documentoId: documento.id,
      fechaEntrega: orden.fechaEntrega || moment().format("YYYY-MM-DD"),
      descripcion: "",
      resumen: orden.resumen || "",
      clienteId: orden.clienteId,
      transporteId: orden.transporteId
    };
  }

  createInvokeSign(orden, documento, config, user) {
    return {
      ordenId: orden.id,
      documentoId: documento.id,
      account: user.account,
      documentoClave: documento.clave,
      cedula: config.cedula,
      namespaceId: process.env.NODE_ENV,
      user: { name: user.name, email: user.email, id: user.id }
    };
  }
}

Facturar.OrdenTotal = (documento, lineas) => {
  let totalServGravados = 0;
  let totalServExcentos = 0;
  let totalMercanciasGravadas = 0;
  let totalMercanciasExcentas = 0;
  let totalServExonerado = 0;
  let totalMercExonerada = 0;
  let totalExonerado = 0;
  let totalVenta = 0;
  let totalDescuentos = 0;
  let totalVentaNeta = 0;
  let totalImpuesto = 0;
  let totalComprobante = 0;
  const config = { maxDecimal: 5 };
  const round = function(value) {
    return exactMath.round(value, -5);
  };

  lineas.forEach(linea => {
    const _subTotal = round(exactMath.mul(linea.precio, linea.cantidad, config));
    const _descuento = round(exactMath.formula(`${_subTotal}*(${linea.descuentoUnitario || 0}/100)`, config));
    const _subTotalConDescuento = round(exactMath.sub(_subTotal, _descuento, config));
    const _impuesto = round(
      exactMath.formula(`${_subTotalConDescuento}*(${(linea.impuestoUnitario || 0) / 100})`, config)
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
    totalIVADevuelto: 0,
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

module.exports = Facturar;

Facturar.InvokeSign = InvokeSign;
