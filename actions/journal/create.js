const Dinero = require("dinero.js");
Dinero.globalLocale = "es-CR";
Dinero.defaultPrecision = 5;
var Errors = require("../../errors");
var moment = require("moment-timezone");
var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");

module.exports = class DefaultCreateAction extends BaseAction {
  preValidate() {
    if (!this.body.journalItem || this.body.journalItem.length == 0)
      throw new Errors.VALIDATION_ERROR("El movimiento tiene que tener lineas");
  }

  async preInsert() {
    var last = await this.knex
      .table("journal")
      .select("name")
      .orderBy("createdAt", "desc")
      .first();
    if (!last) last = { name: `AS-0-${moment().format("YYYY/MM/DD")}` };

    var thisId = parseInt(this.body.name.split("-")[1]);
    var lastId = parseInt(last.name.split("-")[1]) + 1;
    if (thisId != lastId) throw Errors.VALIDATION_ERROR(`El id debe ser ${lastId} pero es ${thisId}`);

    var accounts = await this.knex.table("account").forUpdate();
    var accountMap = {};
    accounts.forEach(account => {
      accountMap[account.id] = account;
    });
    var promises = [];
    JSON.parse(this.body.journalItem).map(item => {
      var account = accountMap[item.accountId];

      var delta = item.debito || item.credito;

      if (account.normalDebit && item.debito) delta = delta * 1;
      else if (account.normalDebit && item.credito) delta = delta * -1;

      if (account.normalCredit && item.credit) delta = delta * 1;
      else if (account.normalCredit && item.debito) delta = delta * -1;

      var adjustBalance = this.getActionInstanceFor("account", "adjustBalancePendiente", true);
      var deltaAccount = { accountId: account.id, delta: delta };

      return adjustBalance.execute("account", deltaAccount);
    });
    return Promise.all(promises);
  }
};
