var BaseAction = require("../../operation/baseAction");
var Errors = require("../../errors");

module.exports = class Archivar extends BaseAction {
  preTransform() {
    this.json = {};
    var keys;
    this.metadata = this.getMetadata();
    var columnKeys = Object.keys(this.metadata.properties);

    keys = Object.keys(this.body);

    columnKeys.forEach(columnKey => {
      if (this.metadata.properties[columnKey].isJSON) {
        if (this.body[columnKey] && typeof this.body[columnKey] != "string") {
          this.json[columnKey] = this.body[columnKey];
          this.body[columnKey] = JSON.stringify(this.body[columnKey]);
        }
      }
    });
  }

  async execute(table, body) {
    this.table = table;
    this.body = body;

    this.preTransform();

    if (!this.body.proveedorId) {
      let responsable = await this.getResponsable(); //active user who send the email
      if (!this.json.emisor.cedula) throw new Errors.SERVER_ERROR("Emisor cedula not found.");
      let proveedor = await this.query("proveedorByCedula")
        .table("proveedor")
        .select()
        .where("cedula", this.json.emisor.cedula)
        .first();
      if (!proveedor) {
        proveedor = await this.getActionAndInvoke("proveedor", "create", {
          cedula: this.json.emisor.cedula,
          name: this.json.emisor.nombre || this.json.emisor.cedula,
          activo: true,
          ownerId: responsable ? responsable.id : null
        });
      } else if (!proveedor.ownerId && responsable)
        await this.getActionAndInvoke("proveedor", "update", {
          id: proveedor.id,
          ownerId: responsable.id,
          _forceUpdate: true
        });

      if (proveedor.ownerId) this.body.ownerId = proveedor.ownerId;
      else if (responsable) this.body.ownerId = responsable.id;

      this.body.proveedorId = proveedor.id;
      if (responsable && responsable.id == proveedor.ownerId) this.body.aprobadoPorResponsable = true;
    }
    return this.getActionAndInvoke(this.table, "update", this.body);
  }

  getResponsable() {
    return this.query("getUser")
      .table("usuario")
      .select()
      .where("email", this.json.emisor.source)
      .first();
  }
};
