var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var moment = require("moment-timezone");

module.exports = class PagoCreateAction extends BaseAction {

  preValidate() {

    this.body.fecha = moment().format("YYYY-MM-DD");
  }

  async preInsert() {

    return true;
  }

  async postInsert() {
    this.body.id = this.results[0];
    this.results = this.body;
    if (!this.body.lineaPagoCxP) throw new Errors.VALIDATION_ERROR(`El pago ${this.body.referencia} no tiene asociada ninguna factura`);
    var promises = JSON.parse(this.body.lineaPagoCxP).map((lineaPago) => {
      lineaPago.pagoCxPId = this.body.id;
      return this.getActionAndInvoke("lineaPagoCxP", "create", lineaPago);
    });
    return Promise.all(promises)
      .then(() => this.results)
  }

}
