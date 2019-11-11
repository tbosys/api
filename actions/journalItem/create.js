
const Dinero = require('dinero.js')
Dinero.globalLocale = 'es-CR';
Dinero.defaultPrecision = 5;
var Errors = require("../../errors");
var moment = require("moment-timezone");
var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");

module.exports = class DefaultCreateAction extends BaseAction {

    async preInsert() {
    
        var newBalance = await this.knex.table("account").select('balance').where("id", this.body.accountId).first();
        this.body.endingBalance = newBalance.balance;

      }


}