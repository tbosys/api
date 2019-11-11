var BaseAction = require("../../operation/baseUpdateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var moment = require("moment-timezone");
var Security = require("../../apiHelpers/security");
const Dinero = require("dinero.js");
Dinero.globalLocale = "es-CR";
Dinero.defaultPrecision = 5;

module.exports = class DefaultUpdateAction extends BaseAction {
  preValidate() {
    this.body.estado = "por aprobar";
    this.fecha = moment().format("YYYY-MM-DD");
  }

  async preUpdate() {
    var keys = Object.keys(this.body);
    if (this.current.consecutivo) {
      if (keys.length > 2 && keys.indexOf("categoria") == -1)
        throw new Errors.VALIDATION_ERROR("Los gastos eletronicos no se pueden editar");
    }
    return true;
  }

  async postUpdate() {
    this.result = this.body;
    return true;
  }
};
