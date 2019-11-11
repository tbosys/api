var BaseAction = require("../../operation/baseUpdateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var moment = require("moment-timezone");
var Security = require("../../apiHelpers/security");
var processOrdenAmounts = require("./helpers/processOrdenAmounts");

const Dinero = require("dinero.js");
Dinero.globalLocale = "es-CR";
Dinero.defaultPrecision = 5;

module.exports = class DefaultUpdateAction extends BaseAction {
  isPending() {
    var pendingStates = ["por reactivar", "por aplicar", "por aprobar", "por imprimir", "por proformar"];
    if (pendingStates.indexOf(this.current.estado) > -1 && this.body.estado != "por archivar") return true;
    return false;
  }

  preValidate() {
    if (this.isPending()) return this.preValidatePending();
    if (this.current.especial && this.body.especial == false)
      throw new Errors.VALIDATION_ERROR("No se puede modificar el campo especial.");

    if (this.body.clienteId)
      throw new Errors.VALIDATION_ERROR("No se puede modificar el cliente de la orden");

    if (this.body.cedula) this.body.cedula = this.body.cedula.trim();

    if (this.body.plazo) throw new Errors.VALIDATION_ERROR("No se puede modificar el plazo de la orden");
  }

  async preUpdate() {
    this.cliente = (await this.getActionAndInvoke("cliente", "forTablet", {
      id: this.body.clienteId || this.current.clienteId
    }))[0];

    if (this.body.ordenLinea) {
      this.body = {
        ...this.body,
        ...(await processOrdenAmounts(this.body, this.getActionAndInvoke.bind(this), this.cliente))
      };
    }

    return true;
  }

  async postUpdate() {
    if (this.isPending()) return this.postUpdatePending();
    else return true;
  }

  async preValidatePending() {
    if (["por aplicar", "por aprobar", "por imprimir"].indexOf(this.current.estado) > -1)
      this.body.estado = "por aplicar";
  }

  async postUpdatePending() {
    this.result = this.body;

    var delta = { updatedAt: this.cliente.updatedAt, id: this.cliente.id };
    if (this.body.cedula && this.body.cedula != this.cliente.cedula) delta.cedula = this.body.cedula;
    if (this.body.emails && this.body.emails != this.cliente.correoDocumentosElectronicos)
      delta.correoDocumentosElectronicos = this.body.emails;
    if (this.body.transporteId && this.body.transporteId != this.cliente.transporteId)
      delta.transporteId = this.body.transporteId;
    if (this.body.ownerId && this.body.ownerId != this.cliente.ownerId) delta.ownerId = this.body.ownerId;

    if (delta.cedula || delta.correoDocumentosElectronicos || delta.transporteId) {
      var updateCedula = this.getActionInstanceFor("cliente", "update");
      await updateCedula.execute("cliente", delta);
    }

    return true;
  }
};
