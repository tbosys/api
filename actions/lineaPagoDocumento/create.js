const Dinero = require("dinero.js");
Dinero.globalLocale = "es-CR";
Dinero.defaultPrecision = 5;

var BaseAction = require("../../operation/baseCreateAction");

module.exports = class LineaPagoDocumentoCreate extends BaseAction {
  async postInsert() {
    this.body.id = this.results[0];

    return this.getActionAndInvoke("saldo", "updateSaldo", {
      monto: this.body.monto,
      diasCredito: this.body.diasCredito,
      documentoId: this.body.documentoId,
      message: "consecutivo recibo: " + this._.consecutivo,
      consecutivo: this._.consecutivo
    });
  }
};
