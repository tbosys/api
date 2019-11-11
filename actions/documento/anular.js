var BaseAction = require("../../operation/baseAction");
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

    return this.anular(table, body);
  }

  async anular(table, body) {
    var id = this.enforceSingleId(body);
    if (!process.env.TESTING) await this.enforceStatus(body, ["por anular"]);

    var createDocumento = this.getActionInstanceFor("documento", "create");

    var documento = await this.knex
      .table("documento")
      .select(["documento.*"])
      .where({ "documento.id": id, documentoAnuladorId: null })
      .first();

    if (!documento) throw new Errors.VALIDATION_ERROR("Este documento ya fue anulado.");

    var productos = await this.knex.table("producto").select(["porcentajeComision", "id"]);
    var productoMap = {};

    productos.forEach(item => {
      productoMap[item.id] = item;
    });

    var movimientos = await this.knex
      .table("movimientoInventario")
      .select()
      .where({ documentoId: id });

    var newDocumentoTipo, informacionReferenciaTipo;
    if (documento.tipo == "FA") {
      newDocumentoTipo = "NC";
      informacionReferenciaTipo = "01";
    } else if (documento.tipo == "NC") {
      informacionReferenciaTipo = "03";
      newDocumentoTipo = "ND";
    } else if (documento.tipo == "ND") {
      informacionReferenciaTipo = "02";
      newDocumentoTipo = "NC";
    }

    await this.knex
      .table("consecutivo")
      .increment(newDocumentoTipo == "NC" ? "consecutivoNotaCredito" : "consecutivoNotaDebito");
    let consecutivos = await this.knex
      .table("consecutivo")
      .select()
      .first()
      .forUpdate();

    var config = this.context.config;

    var cliente = await this.knex
      .table("cliente")
      .select(["id", "cedula", "name", "ownerId", "tipoCedula"])
      .where("id", documento.clienteId)
      .first()
      .forUpdate();
    if (!cliente.ownerId) cliente.ownerId = this.user.id;

    var consecutivo;
    if (newDocumentoTipo == "NC") consecutivo = consecutivos.consecutivoNotaCredito;
    else consecutivo = consecutivos.consecutivoNotaDebito;

    var casaMatriz = "1".pad(3);
    var terminalVenta = "1".pad(5);
    var tipoDocumento = newDocumentoTipo == "NC" ? "03" : "02";
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
      documentoAnuladoDeId: documento.id,
      ownerId: cliente.ownerId,
      fromAnular: true,
      financiero: documento.financiero || documento.financiero == 1 ? true : false,
      clienteId: documento.clienteId,
      tipo: newDocumentoTipo,
      descripcion: "Anulacion por rechazo de documento en Hacienda",
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
      moneda: documento.moneda || "CRC",
      tipoCambio: documento.tipoCambio || 1,
      normativa: JSON.stringify({
        NumeroResolucion: "DGT-R-48-2016",
        FechaResolucion: "20-02-2017 13:22:22"
      }),
      informacionReferencia: JSON.stringify({
        TipoDoc: informacionReferenciaTipo,
        Numero: documento.clave,
        FechaEmision: documento.fechaISO,
        Codigo: "01",
        Razon: "Anulacion por rechazo en servidor de hacienda"
      }),
      totalServGravados: documento.totalServGravados,
      totalServExcentos: documento.totalServExcentos,
      totalMercanciasGravadas: documento.totalMercanciasGravadas,
      totalMercanciasExcentas: documento.totalMercanciasExcentas,
      totalGravado: documento.totalGravado,
      totalServExonerado: documento.totalServExonerado,
      totalMercExonerada: documento.totalMercExonerada,
      totalExonerado: documento.totalExonerado,
      totalIVADevuelto: documento.totalIVADevuelto,
      totalExcento: documento.totalExcento,
      totalVenta: documento.totalVenta,
      totalDescuentos: documento.totalDescuentos,
      totalVentaNeta: documento.totalVentaNeta,
      totalImpuesto: documento.totalImpuesto,
      totalComprobante: documento.totalComprobante,
      saldo: documento.totalComprobante
    };

    documentoNuevo = await createDocumento.execute("documento", documentoNuevo);

    var movimientoPromises = movimientos.map((linea, index) => {
      var movimiento = {
        fromAnular: true,
        fechaISO: fechaYa,
        cantidad: linea.cantidad,
        precio: linea.precio,
        subTotal: linea.subTotal,
        plazo: plazo,
        subTotalConDescuento: linea.subTotalConDescuento,
        impuesto: linea.impuesto,
        excento: linea.excento,
        descuento: linea.descuento,
        total: linea.total,
        impuestoUnitario: linea.impuestoUnitario,
        impuestoCodigoTarifa: linea.impuestoCodigoTarifa || "08",
        descuentoUnitario: linea.descuentoUnitario,
        medida: linea.medida || (linea.mercancia ? "Unid" : "Sp"),
        mercancia: linea.mercancia,
        codigo: linea.codigo,
        detalle: linea.detalle,
        tipo: newDocumentoTipo,
        fecha: moment().format("YYYY-MM-DD"),
        numeroLinea: index + 1,
        naturalezaDescuento: linea.naturalezaDescuento,
        documentoId: documentoNuevo.id,
        clienteId: documento.clienteId,
        ownerId: cliente.ownerId
      };

      if (linea.productoId) movimiento.productoId = linea.productoId;

      if (linea.exoneracion) {
        var exoneracion = JSON.parse(linea.exoneracion);

        movimiento.exoneracion = JSON.stringify({
          TipoDocumento: exoneracion.TipoDocumento,
          NumeroDocumento: exoneracion.NumeroDocumento,
          NombreInstitucion: exoneracion.NombreInstitucion,
          FechaEmision: moment(exoneracion.FechaEmision).format("YYYY-MM-DDT13:00:00+06:00"),
          MontoImpuesto: exoneracion.MontoImpuesto,
          PorcentajeCompra: exoneracion.PorcentajeCompra
        });
      }

      var action = this.getActionInstanceFor("movimientoInventario", "create", true);
      return action.execute("movimientoInventario", movimiento);
    });

    var movimientosNuevos = await Promise.all(movimientoPromises);

    await this.getActionAndInvoke("comisionHistorico", "fromFactura", {
      ownerId: cliente.ownerId,
      movimientos: movimientosNuevos
    });

    await this.knex("documento")
      .update({
        estado: "archivado",
        documentoAnuladorId: documentoNuevo.id
      })
      .where("id", documento.id);

    await this.knex("despacho")
    .update({estado: "por anular"})
    .where("documentoId", documento.id)
    .whereNot("estado", "archivado"); 

    if (documento.ordenId)
      await this.knex("orden")
        .update({
          estado: "archivado"
        })
        .where("id", documento.ordenId);

    await InvokeSign({
      documentoId: documentoNuevo.id,
      account: this.user.account,
      documentoClave: documentoNuevo.clave,
      cedula: config.cedula,
      namespaceId: process.env.NODE_ENV,
      user: { name: this.user.name, email: this.user.email, id: this.user.id }
    });

    var saldoDocumento = await this.knex
      .table("saldo")
      .select()
      .where("documentoId", documento.id)
      .first();
    var saldoDocumentoNC = await this.knex
      .table("saldo")
      .select()
      .where("documentoId", documentoNuevo.id)
      .first();

    if (!saldoDocumento || saldoDocumento.total == 0) return true; //No hace falta hacer pago, la factura no tiene saldo

    var pago = {
      ownerId: cliente.ownerId,
      clienteId: documentoNuevo.clienteId,
      formaPago: "nota credito",
      referencia: documento.consecutivo,
      moneda: documento.moneda,
      contado: documento.plazo == 0,
      tipoCambio: documento.tipoCambio,
      recibo: 0,
      monto: 0, // que lo calcule el api
      lineaPagoDocumento: [
        {
          consecutivo: documentoNuevo.consecutivo,
          documentoId: documentoNuevo.id,
          moneda: documentoNuevo.moneda,
          monto: saldoDocumento.total * -1,
          plazoDocumento: documentoNuevo.plazo,
          _saldoId: saldoDocumentoNC.id,
          tipoCambio: documentoNuevo.tipoCambio,
          tipoDocumento: documentoNuevo.tipo
        },
        {
          consecutivo: documento.consecutivo,
          documentoId: documento.id,
          moneda: documento.moneda,
          monto: documento.totalComprobante,
          plazoDocumento: documento.plazo,
          _saldoId: saldoDocumento.id,
          tipoCambio: documento.tipoCambio,
          tipoDocumento: documento.tipo
        }
      ]
    };
    var action = this.getActionInstanceFor("pagoDocumento", "create");
    var result = await action.execute("pagoDocumento", pago);

    var action = this.getActionInstanceFor("pagoDocumento", "aplicar");
    result = await action.execute("pagoDocumento", { ids: [result.id] });

    return result;
  }
};
