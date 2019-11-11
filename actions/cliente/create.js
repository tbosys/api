const Dinero = require("dinero.js");
Dinero.globalLocale = "es-CR";
Dinero.defaultPrecision = 5;

var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");

module.exports = class DefaultCreateAction extends BaseAction {
  get secure() {
    return false;
  }
  _validate() {
    if (this.body.cedula) this.body.cedula = this.body.cedula.trim();
    this.validate(this.table, this.body);
  }
};
