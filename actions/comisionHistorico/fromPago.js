var BaseAction = require("../../operation/baseAction");

const exactMath = require("exact-math");

var moment = require("moment-timezone");

module.exports = class DefaultUpdateAction extends BaseAction {
  async execute(table, body) {
    this.table = table;
    this.body = body;

    var ordenOwner = this.context.userMap[this.body.ownerId] || {};

    if (ordenOwner.comisiona) {
      let comisionPromises = this.createComisiones(this.body.lineaPagoDocumentos)
        .filter(response => response != null)
        .map(comision => {
          return this.getActionAndInvoke("comisionHistorico", "create", comision);
        });
      return Promise.all(comisionPromises);
    }
    return {};
  }

  createComisiones(lineaPagoDocumento) {
    return lineaPagoDocumento.map(lineaPago => {
      if (!lineaPago.diasCredito < 15) return;
      if (lineaPago.plazoDocumento < 2) return;

      var comision = 0;
      if (lineaPago.diasCredito >= 75) comision = -2;
      else if (lineaPago.diasCredito <= 50) comision = 0.5;

      if (comision == 0) return;
      return {
        fecha: moment().format("YYYY-MM-DD"),
        tipo: "PA" + (comision > 0 ? "+" : "-"),
        ownerId: lineaPago.ownerId,
        monto: exactMath.formula(`${lineaPago.monto}*(${comision}/100)`, { maxDecimal: 5 }),
        lineaPagoDocumentoId: lineaPago.id
      };
    });
  }
};
