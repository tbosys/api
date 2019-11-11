var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var js2xmlparser = require("js2xmlparser");
var moment = require('moment-timezone');
var TipoCedula = require("../../apiHelpers/hacienda/tipoCedula");
var Resumen = require("../../apiHelpers/hacienda/resumen");
var InvokeSign = require("../../apiHelpers/invokeSign");
const Dinero = require('dinero.js')
Dinero.globalLocale = 'es-CR';
Dinero.defaultPrecision = 5;

var fechaYa, multiplier;

module.exports = class DefaultCreateAction extends BaseAction {

  execute(table, body) {
    this.table = table;
    this.body = body;

    return this.anular(table, body);
  }

  async anular(table, body) {
    var id = this.enforceSingleId(body);

    var documento = await this.knex.table("documento").select().where({ id: id }).first();



    return true;
  }
}

