const Dinero = require('dinero.js')
Dinero.globalLocale = 'es-CR';
Dinero.defaultPrecision = 5;

var BaseAction = require("../../operation/baseAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var moment = require("moment-timezone");

class AdjustBalancePendiente extends BaseAction {

  async execute(table, body) {
    this.table = table;
    this.body = body;

    var accounts = await this.knex.table("account").select();
    var now = moment().tz('America/Costa_Rica').format('YYYY/MM/DD HH:mm:ss');

    var registroCuentaContableId = await this.knex.table("registroCuentaContable").insert({
      fecha: moment().tz('America/Costa_Rica').format('YYYY/MM/DD'),
      createdAt: now,
      namespaceId: process.env.NODE_ENV
    });

    var promises = accounts.map((account) => {
      return this.knex.table("registroCuentaContableDetail").insert({
        registroCuentaContableId: registroCuentaContableId,
        accountId: account.id,
        balance: account.balance,
        balancePendiente: account.balancePendiente,
        namespaceId: process.env.NODE_ENV
      })
    })
    return Promise.all(promises);

  }
}

module.exports = AdjustBalancePendiente;
