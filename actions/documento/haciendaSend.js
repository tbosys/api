var BaseAction = require("../../operation/baseAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var InvokeReceive = require("../../apiHelpers/invokeReceive");
let AWS = require("aws-sdk");
var s3 = new AWS.S3();
var parseString = require("xml2js").parseString;
var moment = require("moment");
var Pusher = require("../../apiHelpers/pusher");

var BUCKET = "facturas.efactura.io";

module.exports = class RegistroElectronicoCreate extends BaseAction {
  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.create(table, body);
  }

  async create(table, body) {
    // body.step = ["por imprimir","por enviar","por validar","por notificar"]
    var documento = await this.knex
      .table("documento")
      .where("id", body.documentoId)
      .first();

    await this.getActionAndInvoke("registroElectronico", "create", {
      documentoId: body.documentoId,
      estado: "por validar",
      respuesta: body.response
    });

    await Pusher("DocumentoElectronico", "general", {
      clave: documento.clave,
      estado: "por validar"
    });

    return this.knex
      .table("documento")
      .update({ descripcionEstado: body.response })
      .where("documento.id", body.documentoId);
  }
};
