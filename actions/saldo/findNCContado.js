var QueryAction = require("../../operation/baseQueryAction");
var Errors = require("../../errors");
var moment = require("moment-timezone");

module.exports = class PagoCreateAction extends QueryAction {
  async query(body) {
    var saldos = await this.knex("saldo")
      .select()
      .where({ "saldo.clienteId": body.clienteId })
      .whereIn("saldo.tipo", ["NC", "ND"])
      .where("saldo.total", "!=", 0)
      .orderBy("saldo.tipo", "desc");

    return saldos;
  }
};
