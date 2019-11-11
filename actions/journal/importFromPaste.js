const Dinero = require("dinero.js");
Dinero.globalLocale = "es-CR";
Dinero.defaultPrecision = 5;
var Errors = require("../../errors");
var moment = require("moment-timezone");
var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var JournalParser = require("../../apiHelpers/journalParser");


module.exports = class DefaultCreateAction extends BaseAction {
  preValidate() {
    if (!this.body.ids || !this.body.ids.lines || this.body.ids.lines.length == 0) throw new Errors.VALIDATION_ERROR("El movimiento tiene que tener lineas");
    this.body = JournalParser.journalParser(this.body.ids.lines);
    let debitoTotal = 0;
    let creditoTotal = 0;
    JSON.parse(this.body.journalItem).map(line =>{
      debitoTotal = line.debito ? debitoTotal + line.debito : debitoTotal;
      creditoTotal = line.credito ? creditoTotal + line.credito : creditoTotal;
    });
    debitoTotal = debitoTotal.toFixed(2);
    creditoTotal = creditoTotal.toFixed(2);
    if(debitoTotal != creditoTotal) throw new Errors.VALIDATION_ERROR("Los valores del debe y haber no concuerdan");
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
    if (thisId != lastId) throw new Errors.VALIDATION_ERROR(`El id debe ser ${lastId} pero es ${thisId}`);

    var accounts = await this.knex.table("account").forUpdate();
    var accountMap = {};
    var accountCodesMap = {};
    accounts.forEach(account => {
      accountMap[account.codigo] = account;
      accountCodesMap[account.id] = account.codigo;
    });
    var promises = [];

    JSON.parse(this.body.journalItem).map(item => {
      var account = accountMap[item.accountCode];
      if (!account) throw new Errors.VALIDATION_ERROR(`No encontramos la cuenta ${item.accountCode} favor revisar registros`);
      var delta = item.debito || item.credito;
      promises.push(this.accountsAdjust(account, delta, item, accountMap, accountCodesMap));
    });

    var _rowId = 0;
    let jornalItemAccountId = JSON.parse(this.body.journalItem).map(item => {
        var account = accountMap[item.accountCode];
        delete item.accountCode;
        item.accountId = account.id;
        item.__accountId = account.name;
        item._rowId = _rowId++;
        return item;
      });
    this.body.journalItem = JSON.stringify(jornalItemAccountId);

    return Promise.all(promises);
  }

  accountsAdjust(account, delta, item, accountMap, accountCodesMap) {
      var tempDelta = delta;
      if (account.normalDebit && item.debito) delta = delta * 1;
      else if (account.normalDebit && item.credito) delta = delta * -1;

      if (account.normalCredit && item.credito) delta = delta * 1;
      else if (account.normalCredit && item.debito) delta = delta * -1;

      var adjustBalance = this.getActionInstanceFor("account", "adjustBalancePendiente", true);
      var deltaAccount = { accountId: account.id, delta: delta };
      adjustBalance.execute("account", deltaAccount);

      if(account.accountId){
        var parentAccountCode = accountCodesMap[account.accountId];
        var parentAccount = accountMap[parentAccountCode];
        this.accountsAdjust(parentAccount,tempDelta, item, accountMap, accountCodesMap);
      }
      return true;
  }
};
