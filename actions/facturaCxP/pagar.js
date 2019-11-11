var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");

module.exports = class FacturaPagarAction extends BaseAction {

  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.pagar(table, body);
  }

  async pagar(table, body) {
    var registroAction = this.getActionInstanceFor("registro", "create");

    var result = await this.knex.raw(`UPDATE ${table} SET saldo = saldo - ${body.monto}, estado = "archivado" WHERE id = ${body.id}`, {
      monto: body.monto,
      id: body.id
    }).catch(function (err) {
      throw err;
    });
  }

}