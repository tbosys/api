var moment = require("moment-timezone");
var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");

module.exports = class DefaultCreateAction extends BaseAction {
  async preInsert() {
    this.getResponsable();
    this.body.estado = "por aprobar";

    if (this.body.isManual) {
      delete this.body.isManual;
      await this.processManual();
    } else await this.processElectronic();
  }

  async processElectronic() {
    let responsable = await this.getResponsable(); //active user who send the email
    let proveedor = await this.query("proveedorByCedula")
      .table("proveedor")
      .select()
      .where("cedula", this.json.emisor.cedula)
      .first();
    if (!proveedor) {
      //crear proveedor y asignar responsable
      proveedor = await this.getActionAndInvoke("proveedor", "create", {
        cedula: this.json.emisor.cedula,
        name: this.json.emisor.nombre || this.json.emisor.cedula,
        activo: true,
        ownerId: responsable ? responsable.id : null
      });
    } else if (!proveedor.ownerId && responsable)
      // actualizar proveedor si existe un responsable y antes no
      await this.getActionAndInvoke("proveedor", "update", {
        id: proveedor.id,
        ownerId: responsable.id,
        _forceUpdate: true
      });

    if (proveedor.ownerId) this.body.ownerId = proveedor.ownerId;
    //asignar el responsable de la factura con el del proveedor
    else if (responsable) this.body.ownerId = responsable.id; // sino le ponemos el resposable el sender - si es un usuario. Sino se queda vacio.

    this.body.proveedorId = proveedor.id; // se asigna proveedor a la factura.

    if (responsable && responsable.id == proveedor.ownerId) {
      //si el responsable de la factura es el sender, queda pre-aprobada
      this.body.aprobadoPorResponsable = true;
    }
  }

  async processManual() {
    let responsable = await this.getResponsable();
    var emailToCheckProveedor = this.json.emisor.email;
    if (!responsable) emailToCheckProveedor = this.json.emisor.source;
    let proveedor = await this.query("proveedorByEmail")
      .table("proveedor")
      .select()
      .where("email", emailToCheckProveedor)
      .first();
    if (proveedor) this.body.proveedorId = proveedor.id;

    if (proveedor && proveedor.ownerId) {
      this.body.ownerId = proveedor.ownerId; //asignar el responsable de la factura el responsable del proveedor
      if (responsable && proveedor.ownerId == responsable.id) {
        //si el responsable del proveedor es quien envia, querda pre-aprobada
        this.body.aprobadoPorResponsable = true;
      }
    } else if (responsable) {
      //si no hay proveedor, pero si hay responsable porque envio el correo. Entonces lo asignamos.
      this.body.ownerId = responsable.id;
    }
  }

  getResponsable() {
    return this.query("getUser")
      .table("usuario")
      .select()
      .where("email", this.json.emisor.source)
      .first();
  }
};
