const Dinero = require('dinero.js')
Dinero.globalLocale = 'es-CR';
Dinero.defaultPrecision = 5;
var Errors = require("../../errors");
var moment = require("moment-timezone");
var BaseAction = require("../../operation/baseUpdateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");

module.exports = class DefaultCreateAction extends BaseAction {

  preValidate() {
    if (!this.body.journalItem || this.body.journalItem.length == 0) throw new Errors.VALIDATION_ERROR("El movimiento tiene que tener lineas");

    var journalItems = JSON.parse(this.body.journalItem).map((linea) => {
      delete linea.__accountId;
      return linea;
    })
    this.journalItem = JSON.stringify(journalItems);
    delete this.body.journalItem;
  }

  async preUpdate() {
    this.body.journalItem = this.journalItem;

    var accounts = await this.knex.table("account").forUpdate();
    var accountMap = {};
    accounts.forEach((account) => {
      accountMap[account.id] = account;
    })


    var promises = [];

    var currentJournalItems = this.current.journalItem;
    JSON.parse(currentJournalItems).forEach((item) => {
      var account = accountMap[item.accountId];
      var delta = item.debito || item.credito
      promises.push(this.adjustToPreviousBalance(account, delta, item, accountMap));
    })


    JSON.parse(this.journalItem).forEach((item) => {
      var account = accountMap[item.accountId];
      var delta = item.debito || item.credito;
      promises.push(this.adjustToNewBalance(account, delta, item, accountMap));
    })

    let jornalItemAccountId = JSON.parse(this.body.journalItem).map(item => {
      var account = accountMap[item.accountId];
      item.__accountId = account.name;
      return item;
    });

    this.body.journalItem = JSON.stringify(jornalItemAccountId);

    return Promise.all(promises);
  }

  adjustToPreviousBalance(account, delta, item, accountMap) {
    var tempDelta = delta;
    if (account.normalDebit && item.debito) delta = delta * -1;
    if (account.normalDebit && item.credito) delta = delta * 1;

    if (account.normalCredit && item.credit) delta = delta * -1;
    if (account.normalCredit && item.debito) delta = delta * 1;

    var adjustBalance = this.getActionInstanceFor("account", "adjustBalancePendiente", true);
    var deltaAccount = { accountId: account.id, delta: delta };
    adjustBalance.execute("account", deltaAccount);

    if(account.accountId){
      var parentAccount = accountMap[account.accountId];
      this.adjustToPreviousBalance(parentAccount,tempDelta, item, accountMap);
    }
    return true;
  }

  adjustToNewBalance(account, delta, item, accountMap) {
    var tempDelta = delta;
    if (account.normalDebit && item.debito) delta = delta * 1;
    else if (account.normalDebit && item.credito) delta = delta * -1;

    if (account.normalCredit && item.credito) delta = delta * 1;
    else if (account.normalCredit && item.debito) delta = delta * -1;

    var adjustBalance = this.getActionInstanceFor("account", "adjustBalancePendiente", true);
    var deltaAccount = { accountId: account.id, delta: delta };
    adjustBalance.execute("account", deltaAccount);

    if(account.accountId){
      var parentAccount = accountMap[account.accountId];
      this.adjustToNewBalance(parentAccount,tempDelta, item, accountMap);
    }
    return true;
  }

}