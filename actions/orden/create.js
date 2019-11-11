var Errors = require("../../errors");
var moment = require("moment-timezone");
var BaseAction = require("../../operation/baseCreateAction");

var processOrdenAmounts = require("./helpers/processOrdenAmounts");

module.exports = class DefaultCreateAction extends BaseAction {
  preValidate() {
    if (!this.body.ordenLinea || this.body.ordenLinea.length == 0)
      throw new Errors.VALIDATION_ERROR("La orden tiene que tener productos");

    if (!this.body.clienteId) throw new Errors.VALIDATION_ERROR("La orden debe tener un cliente");

    this.body.estado = "por aplicar";
    this.body.fecha = moment().format("YYYY-MM-DD");

    if (this.body.cedula) this.body.cedula = this.body.cedula.trim();
    if (this.body.tipo == "proforma") this.body.estado = "por proformar";
  }
  async preInsert() {
    var clientes = await this.getActionAndInvoke("cliente", "forTablet", {
      id: this.body.clienteId
    });
    this.cliente = clientes[0];

    if (this.cliente) {
      this.body.vendedorId = this.cliente.vendedorId || null;
      this.body.ownerId = this.cliente.ownerId || this.user.id;
      this.body.zonaId = this.cliente.zonaId || null;
    }

    this.body = {
      ...this.body,
      ...(await processOrdenAmounts(this.body, this.getActionAndInvoke.bind(this), this.cliente))
    };

    return true;
  }

  async postInsert() {
    this.body.id = this.results[0];
    this.results = this.body;

    var delta = { updatedAt: this.cliente.updatedAt, id: this.cliente.id };
    if (this.body.cedula && this.body.cedula != this.cliente.cedula) delta.cedula = this.body.cedula;
    if (this.body.ownerId && this.body.ownerId != this.cliente.ownerId) delta.ownerId = this.body.ownerId;

    if (this.body.emails && this.body.emails != this.cliente.correoDocumentosElectronicos)
      delta.correoDocumentosElectronicos = this.body.emails;
    if (this.body.transporteId && this.body.transporteId != this.cliente.transporteId)
      delta.transporteId = this.body.transporteId;

    if (delta.cedula || delta.correoDocumentosElectronicos || delta.transporteId) {
      var updateCedula = this.getActionInstanceFor("cliente", "update");
      await updateCedula.execute("cliente", delta);
    }

    if (this.body.autoAplicar) await this.getActionAndInvoke("orden", "aplicar", { ids: [this.body.id] });
    return true;
  }
};
