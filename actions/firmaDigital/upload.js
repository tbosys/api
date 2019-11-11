var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  signatureVersion: 'v4'
});

module.exports = class Upload extends BaseAction {

  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.pagar(table, body);
  }

  async pagar(table, body) {
    const params = {
      'Bucket': "p12.efactura.io",
      'Key': `${body.cedula}_${body.isStaging ? "staging" : "production"}/${body.key}`
    };

    return {
      signedRequest: s3.getSignedUrl('putObject', params),
      key: params.Key
    };

  }

}