var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");

const Dinero = require("dinero.js");
Dinero.globalLocale = "es-CR";
Dinero.defaultPrecision = 5;

var moment = require("moment-timezone");
var xero = require("../../apiHelpers/xero");

class DocumentoCreate extends BaseAction {
  preValidate() {
    this.fromOrden = this.body.fromOrden;
    this.fromAnular = this.body.fromAnular;
    this.fromNota = this.body.fromNota;
    this.isNotANota = !this.fromNota;
    this.isNotAnOrder = !this.fromOrden;
    this.isNotAnAnulacion = !this.fromAnular;
    this.fechaYa = moment()
      .tz("America/Costa_Rica")
      .format(); //2018-05-24T07:01:42.539375-06:00;

    delete this.body.fromAnular;
    delete this.body.fromOrden;
    delete this.body.fromNota;

    if (this.body.tipo == "FA" && this.isNotAnOrder)
      throw new Errors.PERMISSION_ERROR("No se pueden crear facturas, solo atraez de una orden");
  }

  async preInsert() {
    let config = this.context.config;
    this.body.codigoActividad = config.codigoActividad;
    this.cliente = await DocumentoCreate.GetCliente(this.knex, this.body);

    if (this.cliente) {
      this.body.ownerId = this.cliente.ownerId || this.user.id;
    }

    if (!this.cliente.cedula ||  this.cliente.cedula == "" ) throw new Errors.PERMISSION_ERROR(`No se pueden crear documento ${this.body.tipo}, porque el cliente no tiene cedula`);

    if (this.body.tipo == "FA" && this.body.plazo > this.cliente.creditoPlazo)
      throw new Errors.PERMISSION_ERROR(
        "No se puede facturar con un plazo mayor al disponible por el cliente."
      );

    if (this.body.tipo == "NC") this.invertTotales();

    if (this.body.tipo == "ND" && this.fromAnular) this.invertTotales(); //Se esta anulando un NC.
  }

  async postInsert() {
    this.body.id = this.results[0];
    this.results = this.body;

    await xero({ id: this.body.id, type: "DOCUMENTO" }, this.context);

    await this.getActionAndInvoke("saldo", "create", {
      total: this.body.totalComprobante,
      documentoId: this.body.id,
      consecutivo: this.body.consecutivo,
      fecha: moment().format("YYYY-MM-DD"),
      tipo: this.body.tipo,
      plazo: this.body.plazo,
      moneda: this.body.moneda,
      tipoCambio: this.body.tipoCambio,
      clienteId: this.body.clienteId,
      ownerId: this.cliente.ownerId
    });

    var registroMetadata = {
      moneda: this.body.moneda,
      tipoCambio: this.body.tipoCambio,
      plazo: this.body.plazo,
      tipo: this.body.tipo
    };

    var tipoPlazo = this.body.plazo == 0 ? "contado" : "credito";

    await this.createRegistro(
      this.body.id,
      "totalVentaNeta",
      "documento",
      this.body.totalVentaNeta,
      registroMetadata,
      this.body.tipo,
      tipoPlazo
    );
    await this.createRegistro(
      this.body.id,
      "totalGravado",
      "documento",
      this.body.totalGravado,
      registroMetadata,
      this.body.tipo,
      tipoPlazo
    );
    await this.createRegistro(
      this.body.id,
      "totalExcento",
      "documento",
      this.body.totalExcento,
      registroMetadata,
      this.body.tipo,
      tipoPlazo
    );
    await this.createRegistro(
      this.body.id,
      "totalComprobante",
      "documento",
      this.body.totalComprobante,
      registroMetadata,
      this.body.tipo,
      tipoPlazo
    );
    await this.createRegistro(
      this.body.id,
      "totalImpuesto",
      "documento",
      this.body.totalImpuesto,
      registroMetadata,
      this.body.tipo,
      tipoPlazo
    );
    await this.createRegistro(
      this.body.id,
      "totalDescuentos",
      "documento",
      this.body.totalDescuentos,
      registroMetadata,
      this.body.tipo,
      tipoPlazo
    );

    return true;
  }

  invertTotales() {
    var adjusted = {
      totalServGravados: this.body.totalServGravados * -1,
      totalServExcentos: this.body.totalServExcentos * -1,
      totalMercanciasGravadas: this.body.totalMercanciasGravadas * -1,
      totalServExonerado: this.body.totalServExonerado * -1,
      totalMercExonerada: this.body.totalMercExonerada * -1,
      totalExonerado: this.body.totalExonerado * -1,
      totalMercanciasExcentas: this.body.totalMercanciasExcentas * -1,
      totalGravado: this.body.totalGravado * -1,
      totalExcento: this.body.totalExcento * -1,
      totalVenta: this.body.totalVenta * -1,
      totalDescuentos: this.body.totalDescuentos * -1,
      totalVentaNeta: this.body.totalVentaNeta * -1,
      totalImpuesto: this.body.totalImpuesto * -1,
      totalComprobante: this.body.totalComprobante * -1
    };
    this.body = { ...this.body, ...adjusted };
  }
}

module.exports = DocumentoCreate;

DocumentoCreate.GetCliente = function(knex, body) {
  return knex
    .table("cliente")
    .select(["vendedorId", "id", "cedula", "name", "ownerId", "creditoPlazo", "tipoCedula"])
    .where("id", body.clienteId)
    .first()
    .forUpdate();
};
