var QueryAction = require("../../operation/baseQueryAction");
var Errors = require("../../errors");
var moment = require("moment-timezone");

module.exports = class PagoCreateAction extends QueryAction {
  async query(body) {
    var saldos = await this.knex("saldo")
      .select(["cliente.name as __clienteId", "saldo.*"])
      .leftJoin("documento", "saldo.documentoId", "documento.id")
      .leftJoin("cliente", "saldo.clienteId", "cliente.id")
      .where({ "saldo.clienteId": body.id })
      .where("saldo.total", "!=", 0);

    saldos.forEach(saldo => {
      if (saldo.fecha) saldo.plazoActual = moment().diff(moment(saldo.fecha), "days");
    });

    saldos.sort((a, b) => {
      if (a.plazoActual == b.plazoActual) return 0;
      if (a.plazoActual > b.plazoActual) return -1;
      return 1;
    });

    return saldos;
  }
};
