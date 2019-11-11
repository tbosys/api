var BaseAction = require("../../operation/baseUpdateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var moment = require("moment-timezone");
var Security = require("../../apiHelpers/security");

module.exports = class DefaultUpdateAction extends BaseAction {
  _validate() {
    this.validate(this.table, this.body, false);
  }

  async postUpdate(result) {
    if (result.tags)
      await this.knex
        .table("contacto")
        .update({ tags: result.tags })
        .where("clienteId", this.body.id);
  }

  async preUpdate() {
    try {
      if (this.body.activo == false) {
        var saldo = await this.knex
          .table("saldo")
          .select()
          .where("id", this.body.id)
          .where("total", "!=", 0)
          .first();
        if (saldo)
          throw new Errors.VALIDATION_ERROR("El cliente tiene saldos pendiente, no se puede desactivar");
      }
    } catch (e) {
      throw e;
    }
  }
};
