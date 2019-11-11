var BaseAction = require("../../operation/baseAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var InvokeReceive = require("../../apiHelpers/invokeReceive");
let AWS = require("aws-sdk");
var s3 = new AWS.S3();
var parseString = require("xml2js").parseString;
var moment = require("moment");
var BUCKET = "facturas.efactura.io";

module.exports = class RegistroElectronicoCreate extends BaseAction {
  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.create(table, body);
  }

  async create(table, body) {
    var documento = await this.knex.table("documento").where("id", body.documentoId);

    return await this.knex.table("registroElectronico").insert({
      consecutivo: documento.consecutivo,
      clave: documento.clave,
      clienteId: documento.clienteId,
      estado: body.estado,
      namespaceId: process.env.NODE_ENV,
      createdBy: this.user.name,
      documentoId: body.documentoId,
      respuesta: body.respuesta
    });
  }
};
