var BaseOperation = require("../operation/baseOperation");
const AWS = require("aws-sdk");
const s3 = new AWS.S3({
  signatureVersion: "v4"
});
const uuidv1 = require("uuid/v1");

class Files extends BaseOperation {
  get table() {
    return "";
  }

  get multiTenantObject() {
    return false;
  }

  async upload(body) {
    var parts = body.key.split(".");
    var fileType = parts[parts.length - 1];
    var fileName = uuidv1() + "/" + body.key;
    var key = `${this.context.config.cedula}/${
      process.env.NODE_ENV == "production" ? "production" : "staging"
    }/${fileName}`;
    const params = {
      Bucket: "uploads.efactura.io",
      Key: key
    };

    return {
      signedRequest: s3.getSignedUrl("putObject", params),
      key: key,
      bucket: "uploads.efactura.io",
      name: parts[0],
      type: fileType
    };
  }
}
module.exports = Files;
