var BaseAction = require("../../operation/baseAction");
var moment = require("moment-timezone");
const Errors = require("../../errors");
const TipoCedula = require("../../apiHelpers/hacienda/tipoCedula");
const InvokeSign = require("../../apiHelpers/invokeSign");

class ImprimirOrden extends BaseAction {
  async execute(table, body) {
    this.table = table;
    this.body = body;
    var nota = body.nota;
    let config = this.context.config;
    var consecutivo = "";

    if (!nota.documentoInterno) {
      await this.knex
        .table("consecutivo")
        .increment(nota.tipo == "NC" ? "consecutivoNotaCredito" : "consecutivoNotaDebito");
      let consecutivos = await this.knex
        .table("consecutivo")
        .select()
        .first()
        .forUpdate();

      if (nota.tipo == "NC") consecutivo = consecutivos.consecutivoNotaCredito;
      else if (nota.tipo == "ND") consecutivo = consecutivos.consecutivoNotaDebito;
    }

    let fechaYa = moment()
      .tz("America/Costa_Rica")
      .format(); //2018-05-24T07:01:42.539375-06:00;

    var casaMatriz = "1".pad(3);
    var terminalVenta = "1".pad(5);
    var tipoDocumento = nota.tipo == "NC" ? "03" : "02";
    var fullConsecutivo = casaMatriz + terminalVenta + tipoDocumento + consecutivo.pad(10);
    this.fullConsecutivo = fullConsecutivo;

    var cedula = config.cedula.pad(12);
    var diamesano = moment().format("DDMMYY");
    var situacion = "1";
    var codigoSecreto = "89898989";

    var clave = "506" + diamesano + cedula + fullConsecutivo + situacion + codigoSecreto;
    var ubicacion = config.ubicacion.split(",");

    var documento = {
      ownerId: nota.ownerId,
      tipo: nota.tipo,
      clienteId: nota.clienteId,
      descripcion: nota.descripcion,
      financiero: true,
      vendedorId: nota.clienteVendedorId,
      consecutivo: nota.documentoInterno ? "" : fullConsecutivo,
      name: fullConsecutivo,
      clave: nota.documentoInterno ? "" : clave,
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
        Nombre: nota.clienteName,
        Identificacion: {
          Tipo: TipoCedula(nota.clienteCedula, nota.clienteTipoCedula),
          Numero: nota.clienteCedula
        }
      }),
      plazo: 90,
      estado: nota.documentoInterno ? "archivado" : "por firmar",
      documentoInterno: nota.documentoInterno,
      medioPago: "04",
      condicionVenta: "02",
      moneda: nota.moneda || "CRC",
      tipoCambio: nota.tipoCambio || 1,
      normativa: JSON.stringify({
        NumeroResolucion: "DGT-R-48-2016",
        FechaResolucion: "20-02-2017 13:22:22"
      }),
      informacionReferencia: JSON.stringify({
        TipoDoc: "99",
        Numero: config.cuentaContableNcFinanciero ? config.cuentaContableNcFinanciero.pad(50) : "00001",
        FechaEmision: moment("2017-10-01")
          .tz("America/Costa_Rica")
          .format(),
        Codigo: "99",
        Razon: nota.descripcion
      }),
      totalServGravados: 0,
      totalServExcentos: nota.totalComprobante,
      totalMercanciasGravadas: 0,
      totalMercanciasExcentas: 0,
      totalServExonerado: 0,
      totalMercExonerada: 0,
      totalExonerado: 0,
      TotalIVADevuelto: 0,
      totalGravado: 0,
      totalExcento: nota.totalComprobante,
      totalVenta: nota.totalComprobante,
      totalDescuentos: 0,
      totalVentaNeta: nota.totalComprobante,
      totalImpuesto: 0,
      totalComprobante: nota.totalComprobante
    };

    documento = await this.getActionAndInvoke("documento", "create", documento);

    var movimiento = {
      fechaISO: fechaYa,
      ownerId: nota.ownerId,
      cantidad: 1,
      precio: nota.totalComprobante,
      subTotal: nota.totalComprobante,
      subTotalConDescuento: nota.totalComprobante,
      impuesto: 0,
      descuento: 0,
      total: nota.totalComprobante,
      impuestoUnitario: 0,
      descuentoUnitario: 0,
      impuestoCodigoTarifa: "01",
      medida: "Sp",
      mercancia: false,
      codigo: JSON.stringify({ Tipo: "04", Codigo: "1023" }),
      detalle: nota.descripcion || "",
      tipo: nota.tipo,
      fecha: moment().format("YYYY-MM-DD"),
      numeroLinea: "1",
      naturalezaDescuento: null,
      documentoId: documento.id,
      clienteId: nota.clienteId
    };

    await this.getActionAndInvoke("movimientoInventario", "create", movimiento);

    await this.getActionAndInvoke("comisionHistorico", "fromFactura", {
      ownerId: nota.ownerId,
      movimientos: [movimiento]
    });

    if (nota.documentoInterno) return documento;

    await InvokeSign({
      documentoId: documento.id,
      account: this.user.account,
      documentoClave: documento.clave,
      cedula: config.cedula,
      namespaceId: process.env.NODE_ENV,
      user: { name: this.user.name, email: this.user.email, id: this.user.id }
    });

    return documento;
  }
}

module.exports = ImprimirOrden;
