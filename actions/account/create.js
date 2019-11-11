const Dinero = require('dinero.js')
Dinero.globalLocale = 'es-CR';
Dinero.defaultPrecision = 5;

var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var moment = require("moment-timezone");

module.exports = class DefaultCreateAction extends BaseAction {

  async preInsert() {
    var accountId = this.body.accountId;
    var nivel = 0;
    while (accountId) {
      var tempAccount = await this.knex.table("account").select().where("id", accountId).first();
      if (tempAccount) {
        nivel++;
        accountId = tempAccount.accountId;
      }
    }
    this.body.nivel = nivel;

    return true;
  }
}