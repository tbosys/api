const Dinero = require('dinero.js')
Dinero.globalLocale = 'es-CR';
Dinero.defaultPrecision = 5;

var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var moment = require("moment-timezone");

module.exports = class DefaultCreateAction extends BaseAction {

  preValidate() {
    this.body.estado = "por aprobar";
    this.body.fecha = moment().format("YYYY-MM-DD");
  }


  async postInsert() {
    this.body.id = this.results[0];
    this.results = this.body;
  }



}

