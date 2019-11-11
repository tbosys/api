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
      .select("documento.*", "cliente.name as clienteName")
      .innerJoin("cliente", "cliente.id", "documento.clienteId")
      .where("documento.id", body.documentoId)
      .first();

    await Pusher("DocumentoElectronico", "general", {
      clave: documento.clave,
      cliente: documento.clienteName,
      estado: "por firmar"
    });

    await this.getActionAndInvoke("registroElectronico", "create", {
      documentoId: body.documentoId,
      estado: "por imprimir",
      respuesta: body.response
    });

    if (body.ordenId)
      await this.getActionAndInvoke("orden", "update", {
        id: body.ordenId,
        pdf: body.pdf,
        _forceUpdate: true
      });

      await this.knex
      .table("despacho")
      .update({ facturaUrl: body.pdf })
      .where("despacho.documentoId", body.documentoId);

    return this.knex
      .table("documento")
      .update({ pdf: body.pdf, estado: "por firmar", descripcionEstado: body.response })
      .where("documento.id", body.documentoId);
  }
};
