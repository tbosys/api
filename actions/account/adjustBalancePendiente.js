const Dinero = require('dinero.js')
Dinero.globalLocale = 'es-CR';
Dinero.defaultPrecision = 5;

var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var moment = require("moment-timezone");

class AdjustBalancePendiente extends BaseAction {

  async execute(table, body) {
    this.table = table;
    this.body = body;

    var accountId = body.accountId;

    while (accountId) {

      var delta = { cantidad: body.delta, accountId: accountId};
        try {
          await this.knex.raw(
            "UPDATE account SET balancePendiente = balancePendiente +:cantidad WHERE id = :accountId",
            delta
          );
        } catch (e) {
            throw new Errors.VALIDATION_ERROR(`Error al actualizar el balance de la cuenta: ${accountId}`);
        }

      var currentAccount = await this.knex.table("account").select().where("id", accountId).first();

      var tempAccount = await this.knex.table("account").select().where("accountId", currentAccount.accountId).first();

      accountId = tempAccount ? tempAccount.accountId : null;
    }

    return body;
  }
}

module.exports = AdjustBalancePendiente;
