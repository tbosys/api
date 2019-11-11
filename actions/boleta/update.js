var BaseAction = require("../../operation/baseUpdateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var moment = require("moment-timezone");
var Security = require("../../apiHelpers/security");
const Dinero = require('dinero.js')
Dinero.globalLocale = 'es-CR';
Dinero.defaultPrecision = 5;

module.exports = class DefaultUpdateAction extends BaseAction {

  preValidate() {
    this.body.estado = "por aprobar";
    this.fecha = moment().format("YYYY-MM-DD");
  }

  async preUpdate() {
    if (this.current.estado == "por costear") this.current.estado == "por aplicar";
    return true;
  }

  async postUpdate() {
    this.result = this.body;
    return true;
  }
}

