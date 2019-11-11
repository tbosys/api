var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var moment = require("moment-timezone");
var Security = require("../../apiHelpers/security");

module.exports = class DefaultCreateAction extends BaseAction {



  _validate() {
    this.validate(this.table, this.body);
    this.validateCedula(this.body.tipoCedula, this.body.cedula);
  }

  validateCedula(tipo, cedula) {
    var validJuridica = ["3101", "3102", "3103", "3104", "3015", "3106"];

    if (tipo == "Jurídica" && (validJuridica.indexOf(cedula.substr(0, 4)) == -1 || cedula.length != 10)) {
      throw new Errors.VALIDATION_ERROR(`La cedula jurídica no es válida`, [{ type: "cedula" }]);
    }
    else if (tipo == "Física" && cedula.length != 9) {
      throw new Errors.VALIDATION_ERROR(`La cedula física no es válida`, [{ type: "cedula" }]);
    }
  }

}