const Dinero = require('dinero.js')
Dinero.globalLocale = 'es-CR';
Dinero.defaultPrecision = 5;


var BaseAction = require("../../operation/baseAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var fs = require("fs");
var https = require('https');
var querystring = require('querystring');
var request = require("superagent");
var moment = require('moment-timezone');


module.exports = class DefaultUpdateAction extends BaseAction {

  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.aplicar(table, body);
  }

  async aplicar(table, body) {

    var id = this.enforceSingleId(body);


    var journal = await this.knex.table("journal").select().where("id", id).first();

    var last = await this.knex.table("journal").select("name").where("isDraft", false).orderBy("createdAt", "desc").first();
    if (!last) last = { name: `AS-0-${moment().format("YYYY/MM/DD")}` }

    var thisId = parseInt(journal.name.split("-")[1]);
    var lastId = parseInt(last.name.split("-")[1]) + 1;
    if (thisId != lastId) throw new Errors.VALIDATION_ERROR(`El consecutivo siguiente debe ser ${lastId} pero se intento aplicar el ${thisId}`)

    if (journal.estado == "por archivar" || journal.estado == "archivado") throw new Errors.VALIDATION_ERROR("El movimiento ya fue aplicado")

    var journalItem = JSON.parse(journal.journalItem);

    var accounts = await this.knex.table("account").forUpdate();
     var accountMap = {};
      accounts.forEach(account => {
        accountMap[account.id] = account;
      });

    var promises = journalItem.map(item => {
      var account = accountMap[item.accountId];
      var delta = item.debito || item.credito

      var JournalItem = this.getActionInstanceFor("journalItem", "create", true);
      this.accountsAdjust(account, delta, item, accountMap);
        var journalItem = {
          name: item.name,
          descripcion: item.descripcion,
          isDebit: item.debito > 0,
          debito: item.debito || 0,
          credito: item.credito || 0,
          moneda: item.moneda,
          montoEnMoneda:item.montoEnMoneda,
          journalId: journal.id,
          accountId: item.accountId,
          startingBalance: account.balance
        }
        return JournalItem.execute("journalItem", journalItem);
    })

    await Promise.all(promises);

    await this.knex.table("journal").update({ isDraft: false, estado: "por archivar" }).where("id", journal.id);
    return true
  }

  accountsAdjust(account, delta, item, accountMap) {
    var tempDelta = delta;
    if (account.normalDebit && item.debito) delta = delta * 1;
    else if (account.normalDebit && item.credito) delta = delta * -1;

    if (account.normalCredit && item.credito) delta = delta * 1;
    else if (account.normalCredit && item.debito) delta = delta * -1;
  
    var adjustBalance = this.getActionInstanceFor("account", "adjustBalance", true);
    var deltaAccount = { accountId: account.id, delta: delta };
    adjustBalance.execute("account", deltaAccount);

    if(account.accountId){
      var parentAccount = accountMap[account.accountId];
      this.accountsAdjust(parentAccount,tempDelta, item, accountMap);
    }
    return true;
  } 
}