var QueryAction = require("../../operation/baseQueryAction");
var Errors = require("../../errors");
var moment = require("moment-timezone");
var Pusher = require("../../apiHelpers/pusher");

module.exports = class RegistroRecentQuery extends QueryAction {
  async query(body) {
    if (this[body.type]) return this[body.type](body);
  }

  async documentosYMovimientos(body) {
    var documento = await this.knex
      .table("documento")
      .select([
        "cliente.direccion as direccion",
        "documento.*",
        "cliente.name as __clienteId",
        "transporte.name as __transporteId",
        "orden.name as ordenName"
      ])
      .innerJoin("cliente", "documento.clienteId", "cliente.id")
      .leftJoin("orden", "documento.ordenId", "orden.id")
      .leftJoin("transporte", "documento.transporteId", "transporte.id")
      .where("documento.id", body.documentoId)
      .first();

    var movimientos = await this.knex
      .table("movimientoInventario")
      .select(["movimientoInventario.*", "producto.name as __productoId"])
      .innerJoin("producto", "movimientoInventario.productoId", "producto.id")
      .where("documentoId", body.documentoId);
    return {
      documento: documento,
      movimientos: movimientos
    };
  }

  documentoWithEmails(body) {
    return this.knex
      .table("documento")
      .select([
        "documento.clienteId",
        "cliente.correoDocumentosElectronicos",
        "cliente.correoDocumentosElectronicosCC"
      ])
      .innerJoin("cliente", "documento.clienteId", "cliente.id")
      .where("documento.id", body.documentoId)
      .first();
  }

  async forFirmar(body) {
    var documento = await this.knex
      .table("documento")
      .where({ id: body.documentoId })
      .first();
    var movimientos = await this.knex.table("movimientoInventario").where({ documentoId: body.documentoId });

    var where = {};

    var firma = this.context.config;

    if (process.env.NODE_ENV != "production") {
      firma.username = firma.username_staging;
      firma.password = firma.password_staging;
      firma.pin = firma.pin_staging;
      firma.certificado = firma.certificado_staging;
    }

    return {
      documento: documento,
      movimientos: movimientos,
      firma: firma
    };
  }
};
