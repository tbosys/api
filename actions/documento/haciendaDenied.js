var BaseAction = require("../../operation/baseAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var InvokeReceive = require("../../apiHelpers/invokeReceive");
let AWS = require("aws-sdk");
var s3 = new AWS.S3();
var parseString = require("xml2js").parseString;
var moment = require("moment");
var Pusher = require("../../apiHelpers/pusher");
var Slack = require("../../apiHelpers/slack");
var BUCKET = "facturas.efactura.io";

module.exports = class RegistroElectronicoCreate extends BaseAction {
  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.create(table, body);
  }

  async create(table, body) {
    var documento = await this.knex
      .table("documento")
      .where("id", body.documentoId)
      .first();

    await this.getActionAndInvoke("registroElectronico", "create", {
      documentoId: body.documentoId,
      estado: "por anular",
      respuesta: body.response
    });

    if (this.context.config.channelSlackFacturacion)
      await Slack(
        this.context.config.channelSlackFacturacion,
        `La ${documento.tipo} y clave ${documento.clave} del ${documento.fecha} por un monto de c/${
          documento.totalComprobante
        } fue rechazada por hacienda. ${process.env.NODE_ENV} ${body.response}`
      );

    var documentoEstado = "por anular";
    if (documento.documentoAnuladoDeId) {
      documentoEstado = "archivado";
    } else {
      if (body.ordenId) {
        await this.getActionAndInvoke("orden", "update", {
          id: body.ordenId,
          remplazaDocumentoClave: documento.clave,
          estado: "por revisar",
          _forceUpdate: true
        });
      }
    }

    var documentoUpdate = { estado: documentoEstado, descripcionEstado: body.response };
    if (body.respuestaXml) documentoUpdate.respuestaXml = body.respuestaXml;

    return this.knex
      .table("documento")
      .update(documentoUpdate)
      .where("documento.id", body.documentoId);
  }
};
