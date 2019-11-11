var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var moment = require("moment-timezone");

module.exports = class DefaultCreateAction extends BaseAction {
  preValidate() {
    if (
      (this.body.total > 0 && this.body.total < 150000 && this.body.moneda == "CRC") ||
      (this.body.total > 0 && this.body.total < 300 && this.body.moneda == "USD")
    )
      this.body.estado = "por pagar";
    else if (!this.body.referencia || (this.body.referencia.length < 40 && !this.body.estado))
      this.body.estado = "por aprobar";
    else if (!this.body.estado) this.body.estado = "por aceptar";

    //if (this.body.saldo == 0) this.body.estado = "archivado";
    this.body.fechaIngreso = moment(Date.now()).format("YYYY-MM-DD");
    this.body.saldo = this.body.total;
    if (this.body.tipo === "NC") {
      this.body.total = this.body.total * -1;
      this.body.impuesto = this.body.impuesto * -1;
      this.body.descuento = this.body.descuento * -1;
      this.body.saldo = this.body.saldo * -1;
      this.body.subTotal = this.body.subTotal * -1;
    }
  }

  async postInsert() {
    var registroAction = this.getActionInstanceFor("registro", "create");
    this.body.id = this.results[0];

    var monto = Number.dineroNumber(this.body.total, this.body.tipoCambio, "times");
    var impuesto = Number.dineroNumber(this.body.impuesto, this.body.tipoCambio, "times");

    var registroMetadata = {
      moneda: this.body.moneda,
      tipoCambio: this.body.tipoCambio,
      referencia: this.body.referencia,
      tipo: this.body.tipo,
      plazo: this.body.plazo
    };
    await this.createRegistro(this.body.id, "total", "cxp", monto, registroMetadata, this.body.tipo, "");

    await this.createRegistro(
      this.body.id,
      "impuesto",
      "cxp",
      impuesto,
      registroMetadata,
      this.body.tipo,
      ""
    );

    await this.createRegistro(this.body.id, "saldo", "saldoCxP", monto, registroMetadata, this.body.tipo, "");

    this.results = this.body;
  }
};
