const Dinero = require("dinero.js");
Dinero.globalLocale = "es-CR";
Dinero.defaultPrecision = 5;
var Errors = require("../../errors");
var moment = require("moment-timezone");
var BaseAction = require("../../operation/baseAction");
var Errors = require("../../errors");

module.exports = class DefaultCreateAction extends BaseAction {
  async execute(table, body) {
    var _this = this;
    this.table = table;
    this.body = body;

    if (!this.body.ids || !this.body.ids.lines || this.body.ids.lines.length == 0) throw new Errors.VALIDATION_ERROR("El movimiento tiene que tener lineas");
    this.accounts = this.body.ids.lines;

    var accounts = await _this.knex.table("account").select().orderBy("id", "DESC");
    await Promise.all(accounts.map((account) => {
      return _this.knex.table("account").delete().where("id", account.id);
    }))

    var cuentaMap = {};
    var tipoMap = {
      "1": "activo",
      "2": "pasivo",
      "3": "patrimonio",
      "4": "ingreso",
      "5": "costo",
      "6": "gasto"
    }

    var debitoMap = {
      "1": true,
      "2": false,
      "3": false,
      "4": false,
      "5": true,
      "6": true
    }

    var promises = this.accounts.map((account) => {
      cuentaMap[account.code] = account;
      account.codigo = account.code + "";
      var codigo1 = account.codigo[0];

      return _this.knex.table("account").insert({
        name: account.name.toLowerCase(),
        balance: account.balance,
        balancePendiente: account.balance,
        codigo: account.code,
        namespaceId: process.env.NODE_ENV,
        tipo: tipoMap[codigo1],
        normalDebit: debitoMap[codigo1],
        normalCredit: !debitoMap[codigo1]
      })
    })
    var ids = await Promise.all(promises);
    promises = [];
    accounts = await _this.knex.table("account").select();
    var updatePromises = accounts.map((account, index) => {
      var parentCodigo = cuentaMap[account.codigo].parentCode + "";
      if (parentCodigo && parentCodigo.length > 0) {
        return _this.knex.table("account").select().where("codigo", parentCodigo).first()
          .then((parent) => {
            if (parent && parent.id) return _this.knex.table("account").update({ accountId: parent.id }).where("id", account.id);
            else return Promise.resolve({})
          })
      }
      return Promise.resolve({});
    })
    await Promise.all(updatePromises);
    return { success: true };
  }
};

