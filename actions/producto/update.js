var BaseAction = require("../../operation/baseUpdateAction");
var Errors = require("../../errors");

module.exports = class DefaultUpdateAction extends BaseAction {
  async preUpdate() {
    try {
      if (this.body.activo == false) {
        var producto = await this.knex
          .table("producto")
          .select("inventario")
          .where("id", this.body.id)
          .first();
        if (producto.inventario > 0)
          throw new Errors.VALIDATION_ERROR(`El producto tiene inventario, no se puede desactivar`);
      }
      return true;
    } catch (e) {
      throw e;
    }
  }
};
