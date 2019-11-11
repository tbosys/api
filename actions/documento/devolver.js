var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var js2xmlparser = require("js2xmlparser");
var moment = require("moment-timezone");
var TipoCedula = require("../../apiHelpers/hacienda/tipoCedula");
var Resumen = require("../../apiHelpers/hacienda/resumen");
var InvokeSign = require("../../apiHelpers/invokeSign");
const Dinero = require("dinero.js");
Dinero.globalLocale = "es-CR";
Dinero.defaultPrecision = 5;

var fechaYa;

module.exports = class DefaultCreateAction extends BaseAction {
  execute(table, body) {
    this.table = table;
    this.body = body;

    return this.devolver(table, body);
  }

  async devolver(table, body) {
    var createDocumento = this.getActionInstanceFor("documento", "create");
    var documentoId = body.movimientos[0].documentoId;
    var clienteId = body.movimientos[0].clienteId;
    var clave = body.movimientos[0].clave;
    var fechaISO = body.movimientos[0].fechaISO;
    var moneda = body.movimientos[0].moneda;
    var tipoCambio = body.movimientos[0].tipoCambio;

    var newDocumentoTipo = "NC";
    var informacionReferenciaTipo = "01";

    var documento = await this.knex
      .table("documento")
      .select(["documento.*"])
      .where({ "documento.id": documentoId })

      .first();

    if (process.env.NODE_ENV == "production" && documento.estado != "archivado")
      throw new Errors.VALIDATION_ERROR("Solo se pueden hacer devoluciones sobre documentos archivados.");

    if (process.env.NODE_ENV == "production" && documento.anulacion == 1)
      throw new Errors.VALIDATION_ERROR("Este documento fue anulado, no se pueden realizar devoluciones.");

    var productos = await this.knex.table("producto").select(["porcentajeComision", "id"]);
    var productoMap = {};

    productos.forEach(item => {
      productoMap[item.id] = item;
    });

    await this.knex
      .table("consecutivo")
      .increment(newDocumentoTipo == "NC" ? "consecutivoNotaCredito" : "consecutivoNotaDebito");
    let consecutivos = await this.knex
      .table("consecutivo")
      .select()
      .first()
      .forUpdate();

    let config = this.context.config;
    var cliente = await this.knex
      .table("cliente")
      .select(["id", "cedula", "name", "ownerId", "tipoCedula"])
      .where("id", clienteId)
      .first()
      .forUpdate();
    if (!cliente.ownerId) cliente.ownerId = this.user.id;

    var consecutivo = consecutivos.consecutivoNotaCredito;

    var casaMatriz = "1".pad(3);
    var terminalVenta = "1".pad(5);
    var tipoDocumento = "03";
    var location = config.ubicacion.split(",");
    var fullConsecutivo = casaMatriz + terminalVenta + tipoDocumento + consecutivo.pad(10);
    this.fullConsecutivo = fullConsecutivo;

    var cedula = config.cedula.pad(12);
    var diamesano = moment().format("DDMMYY");
    var situacion = "1";
    var codigoSecreto = "89898989";
    fechaYa = moment()
      .tz("America/Costa_Rica")
      .format();

    var clave = "506" + diamesano + cedula + fullConsecutivo + situacion + codigoSecreto;
    var ubicacion = config.ubicacion.split(",");
    const plazo = documento.plazo > 0 ? 90 : 0;

    var documentoNuevo = {
      ownerId: cliente.ownerId,
      fromAnular: true,
      clienteId: clienteId,
      tipo: newDocumentoTipo,
      descripcion: body.boleta.descripcion,
      consecutivo: fullConsecutivo,
      name: fullConsecutivo,
      clave: clave,
      fecha: moment().format("YYYY-MM-DD"),
      fechaISO: fechaYa,
      emisor: JSON.stringify({
        Nombre: config.name,
        Identificacion: {
          Tipo: TipoCedula(config.cedula),
          Numero: config.cedula
        },
        Ubicacion: {
          Provincia: ubicacion[0],
          Canton: ubicacion[1],
          Distrito: ubicacion[2],
          Barrio: "01",
          OtrasSenas: "Costa Rica"
        },
        Telefono: {
          CodigoPais: "506",
          NumTelefono: config.telefono
        },
        CorreoElectronico: config.cedula + "@efactura.io"
      }),
      receptor: JSON.stringify({
        Nombre: cliente.name,
        Identificacion: {
          Tipo: TipoCedula(cliente.cedula, cliente.tipoCedula),
          Numero: cliente.cedula
        }
      }),
      plazo: plazo,
      estado: "por firmar",
      medioPago: "04",
      condicionVenta: "02",

      moneda: moneda || "CRC",
      tipoCambio: tipoCambio || 1,
      normativa: JSON.stringify({
        NumeroResolucion: "DGT-R-48-2016",
        FechaResolucion: "20-02-2017 13:22:22"
      }),
      informacionReferencia: JSON.stringify({
        TipoDoc: informacionReferenciaTipo,
        Numero: documento.clave || documento.consecutivo.pad(50),
        FechaEmision: fechaISO || new Date(documento.fecha).toISOString(),
        Codigo: "04",
        Razon: (body.boleta.descripcion || "devolución de mercadería del cliente").substring(0, 80)
      })
    };

    documentoNuevo = await createDocumento.execute("documento", {
      ...documentoNuevo,
      ...ordenTotal(body.movimientos)
    });

    var movimientoPromises = body.movimientos.map((linea, index) => {
      var movimiento = {
        ownerId: cliente.ownerId,
        fechaISO: fechaYa,
        cantidad: linea.cantidad,
        precio: linea.precio,
        subTotal: linea.subTotal,
        plazo: plazo,
        excento: linea.excento,
        subTotalConDescuento: linea.subTotalConDescuento,
        impuesto: linea.impuesto,
        descuento: linea.descuento,
        total: linea.total,
        impuestoUnitario: linea.impuestoUnitario,
        descuentoUnitario: linea.descuentoUnitario,
        impuestoCodigoTarifa: linea.impuestoCodigoTarifa || "08",
        medida: linea.medida || (linea.mercancia ? "Unid" : "Sp"),
        mercancia: linea.mercancia,
        codigo: linea.codigo,
        detalle: linea.detalle,
        productoId: linea.productoId,
        tipo: newDocumentoTipo,
        fecha: moment().format("YYYY-MM-DD"),
        numeroLinea: index + 1,
        naturalezaDescuento: linea.naturalezaDescuento,
        documentoId: documentoNuevo.id,
        clienteId: clienteId
      };
      if (linea.exoneracion) movimiento.exoneracion = linea.exoneracion;

      var action = this.getActionInstanceFor("movimientoInventario", "create");
      return action.execute("movimientoInventario", movimiento);
    });

    var movimientosNuevos = await Promise.all(movimientoPromises);

    await this.getActionAndInvoke("comisionHistorico", "fromFactura", {
      ownerId: cliente.ownerId,
      movimientos: movimientosNuevos
    });

    //await this.knex("documento")
    //      .update({
    //      documentoAnuladorId: documentoNuevo.id
    //  })
    //.where("id", documento.id);

    await InvokeSign({
      documentoId: documentoNuevo.id,
      account: this.user.account,
      documentoClave: documentoNuevo.clave,
      cedula: config.cedula,
      namespaceId: process.env.NODE_ENV,
      user: { name: this.user.name, email: this.user.email, id: this.user.id }
    });

    return body;
  }
};

function ordenTotal(lineas) {
  let totalServGravados = Dinero({ amount: 0 });
  let totalServExcentos = Dinero({ amount: 0 });
  let totalMercanciasGravadas = Dinero({ amount: 0 });
  let totalMercanciasExcentas = Dinero({ amount: 0 });
  let totalGravado = Dinero({ amount: 0 });
  let totalExcento = Dinero({ amount: 0 });
  let totalIVADevuelto = Dinero({ amount: 0 });
  let totalServExonerado = Dinero({ amount: 0 });
  let totalMercExonerada = Dinero({ amount: 0 });
  let totalExonerado = Dinero({ amount: 0 });

  let totalVenta = Dinero({ amount: 0 });
  let totalDescuentos = Dinero({ amount: 0 });
  let totalVentaNeta = Dinero({ amount: 0 });
  let totalImpuesto = Dinero({ amount: 0 });
  let totalComprobante = Dinero({ amount: 0 });

  lineas.forEach(linea => {
    var exoneracion = {};
    if (linea.exoneracion) exoneracion = JSON.parse(linea.exoneracion);

    const _subtotal = Dinero({ amount: parseInt(linea.precio * 100000) }).multiply(
      parseFloat(linea.cantidad || 0),
      "HALF_UP"
    );
    const _descuento = _subtotal.percentage(linea.descuentoUnitario);
    const _subTotalConDescuento = _subtotal.subtract(_descuento, "HALF_UP");

    const _impuesto = _subtotal.subtract(_descuento).percentage(linea.impuestoUnitario);
    const dineroExcentoPorcentaje = Dinero({
      amount: (exoneracion.PorcentajeCompra || 0) * 100000
    });

    const _porcentajeImpuesto = Dinero({ amount: 100 * 100000 })
      .subtract(dineroExcentoPorcentaje)
      .toRoundedUnit(2);

    var _subTotalGravado = Dinero({ amount: 0 }).add(_subtotal.percentage(_porcentajeImpuesto));
    var _subTotalExcento = Dinero({ amount: 0 }).add(_subtotal.percentage(exoneracion.PorcentajeCompra || 0));

    if (linea.mercancia) {
      totalMercanciasExcentas = totalMercanciasExcentas.add(_subTotalExcento, "HALF_UP");
      totalMercanciasGravadas = totalMercanciasGravadas.add(_subTotalGravado, "HALF_UP");
    } else {
      totalServExcentos = totalServExcentos.add(_subtotal).add(_subTotalExcento, "HALF_UP");
      totalServGravados = totalServGravados.add(_subtotal).add(_subTotalGravado, "HALF_UP");
    }
    totalVenta = totalVenta.add(_subtotal, "HALF_UP");
    totalImpuesto = totalImpuesto.add(_impuesto, "HALF_UP");
    totalDescuentos = totalDescuentos.add(_descuento, "HALF_UP");
    totalVentaNeta = totalVentaNeta.add(_subtotal, "HALF_UP").subtract(_descuento, "HALF_UP");
    totalComprobante = totalComprobante
      .add(_subtotal, "HALF_UP")
      .subtract(_descuento, "HALF_UP")
      .add(_impuesto, "HALF_UP");
  });

  return {
    totalServGravados: totalServGravados.toRoundedUnit(5, "HALF_UP"),
    totalServExcentos: totalServExcentos.toRoundedUnit(5, "HALF_UP"),
    totalMercanciasGravadas: totalMercanciasGravadas.toRoundedUnit(5, "HALF_UP"),
    totalMercanciasExcentas: totalMercanciasExcentas.toRoundedUnit(5, "HALF_UP"),

    totalServExonerado: totalServExonerado.toRoundedUnit(5, "HALF_UP"),
    totalMercExonerada: totalMercExonerada.toRoundedUnit(5, "HALF_UP"),
    totalExonerado: totalExonerado.toRoundedUnit(5, "HALF_UP"),
    totalIVADevuelto: totalIVADevuelto.toRoundedUnit(5, "HALF_UP"),
    totalGravado: totalMercanciasGravadas.add(totalServGravados).toRoundedUnit(5, "HALF_UP"),
    totalExcento: totalMercanciasExcentas.add(totalServExcentos).toRoundedUnit(5, "HALF_UP"),
    totalVenta: totalVenta.toRoundedUnit(5, "HALF_UP"),
    totalDescuentos: totalDescuentos.toRoundedUnit(5, "HALF_UP"),
    totalVentaNeta: totalVentaNeta.toRoundedUnit(5, "HALF_UP"),
    totalImpuesto: totalImpuesto.toRoundedUnit(5, "HALF_UP"),
    totalComprobante: totalComprobante.toRoundedUnit(5, "HALF_UP")
  };
}
