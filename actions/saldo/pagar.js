var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");

var moment = require("moment-timezone");

const Dinero = require("dinero.js");
Dinero.globalLocale = "es-CR";
Dinero.defaultPrecision = 5;

module.exports = class DefaultUpdateAction extends BaseAction {
  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.pagar(table, body);
  }

  async pagar(table, body) {
    this.enforceSingleId(body);
    body = body.ids;
    var plazo = 0;

    var saldo = await this.knex
      .table(table)
      .select()
      .where("id", body.id)
      .first();

    if (!saldo) throw new Errors.VALIDATION_ERROR(`Este saldo se pago previamente.`);
    if (saldo.plazo != 0)
      throw new Errors.VALIDATION_ERROR(`Solo se puede pagar saldos de contado de esta forma.`);
    if (saldo.tipo != "FA") throw new Errors.VALIDATION_ERROR(`Solo se pueden pagar facturas de esta forma`);
    if (!body.formaPago || !body.referencia)
      throw new Errors.VALIDATION_ERROR(`Debe ingresar una forma de pago y referencia`);

    var ncs = await this.knex("saldo")
      .select()
      .where({ "saldo.clienteId": saldo.clienteId })
      .whereIn("saldo.tipo", ["NC", "ND"])
      .where("saldo.total", "!=", 0)
      .orderBy("saldo.tipo", "desc");

    var lines = [
      {
        consecutivo: saldo.consecutivo,
        documentoId: saldo.documentoId,
        moneda: saldo.moneda,
        monto: saldo.total,
        plazoDocumento: 0,
        _saldoId: saldo.id,
        tipoCambio: saldo.tipoCambio,
        tipoDocumento: saldo.tipo
      }
    ];

    var saldoPendiente = saldo.total;
    var montoNc = 0;
    ncs.forEach(nc => {
      var pagoNc = nc.total;
      var checkSum = Number.dineroNumber(saldoPendiente, nc.total, "plus");
      if (checkSum < 0) pagoNc = saldoPendiente * -1;
      saldoPendiente = Number.dineroNumber(saldoPendiente, pagoNc, "plus");
      montoNc += pagoNc;
      if (pagoNc === 0) return;
      lines.push({
        consecutivo: nc.consecutivo,
        documentoId: nc.documentoId,
        moneda: nc.moneda,
        monto: pagoNc,
        plazoDocumento: 0,
        _saldoId: nc.id,
        tipoCambio: nc.tipoCambio,
        tipoDocumento: nc.tipo
      });
    });

    var montoPago = saldo.total + montoNc;

    var pago = {
      clienteId: saldo.clienteId,
      formaPago: body.formaPago,
      referencia: body.referencia,
      moneda: saldo.moneda,
      contado: true,
      tipoCambio: saldo.tipoCambio,
      recibo: 0,
      monto: montoPago,
      lineaPagoDocumento: lines
    };
    var action = this.getActionInstanceFor("pagoDocumento", "create");
    var result = await action.execute("pagoDocumento", pago);

    var action = this.getActionInstanceFor("pagoDocumento", "aplicar");
    result = await action.execute("pagoDocumento", { ids: [result.id] });

    return result;
  }
};
