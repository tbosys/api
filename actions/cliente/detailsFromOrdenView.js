var QueryAction = require("../../operation/baseQueryAction");
var Errors = require("../../errors");
var moment = require("moment-timezone");

module.exports = class RegistroRecentQuery extends QueryAction {
  get secure() {
    return false;
  }
  async query(body) {
    var cliente = await this.knex("cliente")
      .select()
      .where("id", "=", body.id)
      .first();

    var saldos = await this.knex("saldo")
      .select(["fecha", "consecutivo", "total"])
      .where("clienteId", "=", cliente.id)
      .where("saldo.total", "!=", 0);

    saldos.forEach(saldo => {
      saldo.plazoActual = moment().diff(moment(saldo.fecha), "days");
    });

    cliente.saldos = saldos;
    return cliente;
  }
};
