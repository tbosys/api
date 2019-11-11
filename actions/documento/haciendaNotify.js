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
      estado: "por notificar",
      respuesta: body.response
    });

    if (body.ordenId) {
      var orden = await this.knex
        .table("orden")
        .select("estado")
        .where("id", body.ordenId)
        .first();
      if (orden.estado != "archivado")
        await this.getActionAndInvoke("orden", "update", {
          id: body.ordenId,
          pdf: body.pdf,
          estado: "archivado",
          _forceUpdate: true
        });
    }

    if (documento.estado != "archivado")
      await this.knex
        .table("documento")
        .update({ estado: "archivado", descripcionEstado: body.response })
        .where("documento.id", body.documentoId);

    try {
      await Pusher("DocumentoElectronico", "general", {
        clave: documento.clave,
        estado: "archivado",
        complete: true
      });
    } catch (e) {}

    return { success: true };
  }
};
