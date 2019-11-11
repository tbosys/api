var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var Parser = require("../../apiHelpers/xmlParser");
var InvokeReceive = require("../../apiHelpers/invokeReceive");

let AWS = require("aws-sdk");
var s3 = new AWS.S3();
var moment = require("moment");
var moment = require("moment-timezone");
var parseString = require("xml2js").parseString;
var BUCKET = "facturas.efactura.io";

module.exports = class FacturaImportAction extends BaseAction {
  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.importar(table, body);
  }

  //emisor,
  //clave
  async importar(table, body) {
    var id = this.enforceSingleId(body);

    var gastoId = id;

    var gasto = await this.query("getGasto")
      .table("gasto")
      .where("id", gastoId)
      .first();

    await this.invokeReceive(gasto);
    return gasto;
  }

  invokeReceive(gasto) {
    return InvokeReceive({
      account: this.user.account,
      emailId: gasto.emailId,
      mensajePayload: JSON.parse(gasto.mensajeEnviadoXml).payload,
      mensajeReceptor: JSON.parse(gasto.mensajeEnviadoXml).xml,
      gastoId: gasto.id
    });
  }
};
