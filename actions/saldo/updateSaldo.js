var BaseAction = require("../../operation/baseAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");

var moment = require("moment-timezone");

module.exports = class DefaultUpdateAction extends BaseAction {
  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.pagar(table, body);
  }

  async pagar(table, body) {
    var saldo = await this.knex
      .table(table)
      .select("id", "history", "total")
      .where("documentoId", this.body.documentoId)
      .first();

    if (!saldo)
      throw new Errors.VALIDATION_ERROR(
        "El saldo del documento " +
          this.body.consecutivo +
          " ya no esta. El error puede ser normal, si estuviese en otro pago aplicado."
      );

    try {
      const Dinero = require("dinero.js");
      Dinero.globalLocale = "es-CR";
      Dinero.defaultPrecision = 5;

      var newSaldo = Number.dineroRaw(saldo.total, this.body.monto, "minus");

      var history = JSON.parse(saldo.history || "[]");
      history.push({
        createdAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        montoInicial: saldo.total,
        delta: this.body.monto,
        message: this.body.message,
        createdBy: this.user.name
      });
      var res = await this.knex
        .table("saldo")
        .update({
          total: this.knex.raw("total - :monto", { monto: this.body.monto }),
          history: JSON.stringify(history),
          activo: !newSaldo.isZero()
        })
        .where("documentoId", this.body.documentoId);
    } catch (e) {
      if (e.sqlMessage.indexOf("saldo de la") > -1)
        throw new Errors.VALIDATION_ERROR(
          `Revise el saldo de los documentos del recibo, el monto a pagar fue superior al saldo. Consecutivo Recibo: ${
            this.body.consecutivo
          }`
        );
    }

    return true;
  }
};
