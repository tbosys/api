var BaseAction = require("../../operation/baseUpdateAction");
var Errors = require("../../errors");

module.exports = class DefaultUpdateAction extends BaseAction {
  prevalidate() {
    if (
      this.body.aprobadoPorResponsable != null &&
      this.current.ownerId &&
      this.user.id != this.current.ownerId
    )
      throw new Errors.VALIDATION_ERROR("Un documento solo puede ser aprobado por su responsable");
  }

  async preUpdate() {
    //si se le asigno proveedor a mano, asignar owner del proveedor.
    if (!this.current.proveedorId && this.body.proveedorId) {
      let proveedor = await this.query("getProveedorById")
        .table("proveedor")
        .select("ownerId")
        .where("id", this.body.proveedorId);
      if (!this.body.ownerId) this.body.ownerId = proveedor.ownerId;
    }
  }
};
