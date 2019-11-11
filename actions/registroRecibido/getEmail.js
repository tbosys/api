var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
var Parser = require("../../apiHelpers/xmlParser");
var InvokeReceive = require("../../apiHelpers/invokeReceive");
const simpleParser = require('mailparser').simpleParser;

let AWS = require('aws-sdk');
var s3 = new AWS.S3();
var moment = require("moment");
var moment = require("moment-timezone");
var parseString = require('xml2js').parseString;
var BUCKET = "facturas.efactura.io"


module.exports = class FacturaImportAction extends BaseAction {

  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.importar(table, body);
  }


  //emisor,
  //clave
  async importar(table, body) {
    var registroId = body.registroId;

    var registro = await this.knex.table("registroRecibido").where("id", registroId).first();
    var emailContent = await Receive.downloadEmail(registro.emailId);
    emailContent = emailContent.toString('utf8');
    var parsedEmail = await simpleParser(emailContent);
    registro.email = parsedEmail;
    return registro;

  }

}


var Receive = {};

Receive.downloadEmail = (emailId) => {
  return s3.getObject({
    Bucket: BUCKET,
    Key: `emails/${emailId}`
  }).promise()
    .then((rawObject) => {
      return rawObject.Body
    })
}


Receive.downloadFile = async (key) => {

  return s3.getObject({
    Bucket: BUCKET,
    Key: key,
  }).promise()
    .then((response) => {
      return response.Body;
    })
}




exports.handler = Receive;











