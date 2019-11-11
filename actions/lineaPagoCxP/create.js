var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");

module.exports = class DefaultCreateAction extends BaseAction {

  async postInsert() {
    this.body.id = this.results[0];
    var action = this.getActionInstanceFor("facturaCxP", "pagar");
    this.results = this.body;
    var metadata = { referencia: this.body.referencia, moneda: this.body.moneda, tipoCambio: this.body.tipoCambio };
    await this.createRegistro(this.body.id, "monto", "pagoCxp", this.body.monto, metadata, this.body.tipo, "");
    await this.createRegistro(this.body.id, "monto", "saldoCxP", this.body.monto * -1, metadata, this.body.tipo, "");


    return action.execute("facturaCxP", { id: this.body.facturaCxPId, monto: this.body.monto, tipoCambio: this.body.tipoCambio });
  }

}