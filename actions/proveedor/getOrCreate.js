var BaseAction = require("../../operation/baseAction");
var Errors = require("../../errors");

module.exports = class DefaultCreateAction extends BaseAction {
  async execute(table, body) {
    let responsableId = await this.getResponsableId(body.emisor);
    let proveedor = await this.getProveedor(body);

    if (proveedor && responsableId && !proveedor.responsableId) {
      // Update Proveedor Responsable if it's empty and proveedor has it.
      await this.getActionAndInvoke(this.table, "update", {
        id: proveedor.id,
        updatedAt: proveedor.updatedAt,
        ownerId: responsableId
      });
    } else if (!proveedor) {
      if (body.emisor.nombre.toLowerCase() == "desconocido") body.emisor.nombre = body.emisor.cedula;
      proveedor = await this.getActionAndInvoke("proveedor", "create", {
        name: body.emisor.nombre,
        cedula: body.emisor.cedula,
        ownerId: responsableId
      });
    }
    proveedor.sourceUserId = responsableId;
    return proveedor;
  }

  async getResponsableId(emisor) {
    var responsableId;
    if (emisor.source) {
      let responsable = await this.query("getUser")
        .table("usuario")
        .select()
        .where("email", emisor.source)
        .first();
      if (responsable) responsableId = responsable.id;
    }
    return responsableId;
  }

  getProveedor(body) {
    let query = this.query("getProveedor")
      .table(this.table)
      .select();
    if (body.proveedorId) query = query.where("id", body.proveedorId);
    else if (body.emisor) query = query.where("cedula", body.emisor.cedula).first();
    else return null;
    return query.first();
  }
};
