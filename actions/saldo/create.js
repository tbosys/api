var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");

module.exports = class DefaultCreateAction extends BaseAction {
  preValidate() {
    this.body.estado = "por vencer";
    this.body.name = this.body.consecutivo;
    this.body.activo = true;
    this.body.history = "[]";
  }

  async postInsert() {
    this.body.id = this.results[0];
    this.results = this.body;

    var metadata = {
      consecutivo: this.body.consecutivo,
      tipo: this.body.tipo,
      plazo: this.body.plazo,
      moneda: this.body.moneda,
      tipoCambio: this.body.tipoCambio
    };
    await this.createRegistro(
      this.body.id,
      "total",
      "saldo",
      this.body.total,
      metadata,
      this.body.tipo,
      this.body.plazo === 0 ? "contado" : "credito"
    );
  }
};
