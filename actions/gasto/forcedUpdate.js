const Dinero = require('dinero.js')
Dinero.globalLocale = 'es-CR';
Dinero.defaultPrecision = 5;

var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var fs = require("fs");
var https = require('https');
var querystring = require('querystring');
var request = require("superagent");
var js2xmlparser = require("js2xmlparser");
var TipoCedula = require("../../apiHelpers/hacienda/tipoCedula");
var Resumen = require("../../apiHelpers/hacienda/resumen");
var InvokeSign = require("../../apiHelpers/invokeSign");
var moment = require('moment-timezone');


module.exports = class DefaultUpdateAction extends BaseAction {

  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.update(table, body);
  }

  async update(table, body) {

    var delta = {
      estado: body.estado
    }
    if (body.respuestaXML) delta.respuestaXML = body.respuestaXML;

    await this.knex.table(table).update(delta).where("id", body.id)

    return body;

  }
}
