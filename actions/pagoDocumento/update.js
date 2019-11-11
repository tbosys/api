var BaseAction = require("../../operation/baseUpdateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var moment = require("moment-timezone");

module.exports = class DefaultUpdateAction extends BaseAction {
  preValidate() {
    this.body.estado = "por aplicar";

    if (this.body.contado) throw new Errors.VALIDATION_ERROR("No se puede modificar la columna contado");
    if (this.body.clienteId) throw new Errors.VALIDATION_ERROR("No se puede modificar la columna cliente");
  };

  async preUpdate() {
    const lineaPago =  !this.body.lineaPagoDocumento ?
      await this.knex
      .table("pagoDocumento")
      .select("lineaPagoDocumento")
      .where({ id: this.body.id})
      .first()
    : this.body.lineaPagoDocumento;
    
    if (!this.body.contado && this.body.recibo != 0) {
      const reciboExist = await this.knex
        .table("pagoDocumento")
        .select()
        .where({ recibo: this.current.recibo, contado: 0 })
        .whereIn("estado", ["archivado", "por archivar"]);
      if (reciboExist.length > 0)
        throw new Errors.VALIDATION_ERROR(`Ya existe un pago con numero de recibo ${this.current.recibo}`);
    }

    if (this.body.lineaPagoDocumento){
      if (JSON.parse(this.body.lineaPagoDocumento).length == 0) throw new Errors.VALIDATION_ERROR("Este pago no tiene lineas");
      let lineas = JSON.parse(this.body.lineaPagoDocumento);
      var monto = lineas.reduce((acumulator, currentValue) => {
        return Number.dineroNumber(acumulator, currentValue.monto, "plus");
      }, 0);
      this.body.monto = monto;
      const ids = lineas.map(linea => linea._saldoId);
      const unique = ids.reduce((id, nextId) => (id.includes(nextId) ? id : [...id, nextId]), []);
      if (unique.length != lineas.length) throw new Errors.VALIDATION_ERROR("No se puede guardar, hay documento duplicados en el pago");
    } 

    this.cliente = await this.knex
      .table("cliente")
      .select("vendedorId", "ownerId")
      .where("id", this.current.clienteId)
      .first();

    if (this.cliente) {
      this.body.vendedorId = this.cliente.vendedorId || null;
      this.body.ownerId = this.cliente.ownerId || null;
    }

    return true;
  }
};
