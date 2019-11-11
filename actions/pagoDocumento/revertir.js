const Dinero = require("dinero.js");

Dinero.globalLocale = "es-CR";
Dinero.defaultPrecision = 5;
var moment = require("moment-timezone");

var BaseAction = require("../../operation/baseAction");
var numeral = require("numeral");
var Errors = require("../../errors");

module.exports = class DefaultUpdateAction extends BaseAction {
  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.aplicar(table, body);
  }

  async aplicar(table, body) {
    var id = this.enforceSingleId(body);

    var recibo = await this.knex
      .table(table)
      .select(["pagoDocumento.*", "cliente.name", "cliente.cedula"])
      .where("pagoDocumento.id", id)
      .innerJoin("cliente", "cliente.id", "pagoDocumento.clienteId")
      .first();

    if (recibo.estado != "archivado")
      throw new Errors.VALIDATION_ERROR("El estado de este recibo no es archivado");

    var lineas = await this.knex
      .table("lineaPagoDocumento")
      .select([
        "lineaPagoDocumento.*",
        "documento.consecutivo as _documentoConsecutivo",
        "documento.fecha as _documentoFecha",
        "documento.plazo as _documentoPlazo",
        "documento.tipo as _tipo",
        "documento.clienteId as _clienteId"
      ])
      .innerJoin("documento", "documento.id", "lineaPagoDocumento.documentoId")
      .where("pagoDocumentoId", id);

    var count = lineas.length - 1;
    while (count > -1) {
      var linea = lineas[count];
      var saldo = await this.knex
        .table("saldo")
        .select("id")
        .where("documentoId", linea.documentoId)
        .first();

      if (!saldo)
        saldo = await this.getActionAndInvoke("saldo", "create", {
          total: 0,
          documentoId: linea.documentoId,
          consecutivo: linea._documentoConsecutivo,
          fecha: linea._documentoFecha,
          tipo: linea._tipo,
          history: JSON.stringify([
            {
              createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
              montoInicial: 0,
              delta: linea.monto,
              message: "Recreado por reversion",
              createdBy: this.user.name
            }
          ]),
          plazo: linea._documentoPlazo,
          moneda: body.moneda,
          tipoCambio: body.tipoCambio,
          clienteId: recibo.clienteId,
          ownerId: recibo.ownerId
        });

      linea._saldoId = saldo.id;
      count--;
    }

    var newRecibo = {
      estado: "por aplicar",
      pagoOriginalId: recibo.id,
      clienteId: recibo.clienteId,
      referencia: "consecutivo original: " + recibo.consecutivo,
      monto: recibo.monto * -1,
      recibo: (recibo.recibo || 0) * -1,
      tipoCambio: recibo.tipoCambio,
      formaPago: "reversion",
      fecha: moment().format("YYYY-MM-DD"),
      ownerId: recibo.ownerId,
      vendedorId: recibo.vendedorId,
      fechaIngreso: moment().format("YYYY-MM-DD HH:mm:ss")
    };
    var newLineas = lineas.map(item => {
      const plazo = parseInt(item.plazoDocumento);
      newRecibo.contado = plazo == 0 ? true : false;
      return {
        ...item,
        tipoCambio: item.tipoCambio,
        tipoDocumento: "RD-" + item.tipoDocumento,
        plazoDocumento: plazo,
        monto: item.monto * -1,
        fecha: moment().format("YYYY-MM-DD"),
        id: null
      };
    });

    newRecibo.lineaPagoDocumento = JSON.stringify(newLineas);

    var pagoDocumento = await this.getActionAndInvoke("pagoDocumento", "create", newRecibo);

    return pagoDocumento;
  }
};
