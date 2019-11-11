var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({
  signatureVersion: "v4"
});

module.exports = class Upload extends BaseAction {
  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.update(table, body);
  }

  async update(table, body) {
    return {};
  }
};
