var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var moment = require("moment-timezone");

module.exports = class DefaultCreateAction extends BaseAction {
  preValidate() {
    if (!this.body.lineaPagoDocumento || this.body.lineaPagoDocumento.length == 0)
      throw new Errors.VALIDATION_ERROR("El pago debe que tener facturas");

    this.body.estado = "por aplicar";
    if (!this.body.contado) this.body.contado = false;
    this.body.fecha = moment().format("YYYY-MM-DD");
    this.body.fechaIngreso = moment().format("YYYY-MM-DD HH:mm:ss");
  }

  async preInsert() {
    if (this.body.recibo && this.body.recibo != 0) {
      const reciboExist = await this.knex
        .table("pagoDocumento")
        .select()
        .where({ recibo: this.body.recibo, contado: 0 });
      if (reciboExist.length > 0)
        throw new Errors.VALIDATION_ERROR(`Ya existe un pago con numero de recibo ${this.body.recibo}`);
    }

    let lineas = JSON.parse(this.body.lineaPagoDocumento);
    const ids = lineas.map(linea => linea._saldoId);
    const unique = ids.reduce((id, nextId) => (id.includes(nextId) ? id : [...id, nextId]), []);
    if (unique.length != lineas.length)
      throw new Errors.VALIDATION_ERROR(`No se puede guardar, hay documento duplicados en el pago`);

    var monto = lineas.reduce((acumulator, currentValue) => {
      return Number.dineroNumber(acumulator, currentValue.monto, "plus");
    }, 0);

    this.body.monto = monto;

    this.cliente = await this.knex
      .table("cliente")
      .select("id","ownerId", "vendedorId", "name", "cedula", "tipoCedula")
      .where("id", this.body.clienteId)
      .first();

    if (this.cliente) {
      this.body.vendedorId = this.cliente.vendedorId || null;
      this.body.ownerId = this.cliente.ownerId || null;
    }

    return true;
  }

  async postInsert() {
    this.body.id = this.results[0];
    this.results = this.body;

    return true;
  }
};
