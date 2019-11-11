var BaseAction = require("../../operation/baseUpdateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var moment = require("moment-timezone");
var Security = require("../../apiHelpers/security");

module.exports = class DefaultUpdateAction extends BaseAction {

  preValidate() {
    this.body.estado = "por aprobar";
    if (this.body.total) this.body.saldo = this.body.total;
  }

  checkSecurity() {

    Security.checkUpdate(this.metadata, this.user, this.getDeltaFields(), {
      "saldo": () => {
        if (this.current.estado == "por aceptar") return true;
        return false;
      },
      "estado": () => {
        if (this.current.estado == "por pagar" && this.body.estado == "por aprobar") return true;
        else if (this.current.estado != "archivado" && this.body.estado == "por aceptar") return true;
        return false;
      }
    });
  }

}