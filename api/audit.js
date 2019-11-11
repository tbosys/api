const Errors = require("../errors");

var BaseOperation = require("../operation/baseOperation");
var Parser = require("../apiHelpers/xmlParser");
var BodyHelper = require("../operation/bodyHelper");
const AWS = require("aws-sdk");
var Promise = require("bluebird");
var RequireAll = require("require-all");
const PATH = require("path");
const dirTree = require("directory-tree");

const s3 = new AWS.S3({
  signatureVersion: "v4"
});

class Audit extends BaseOperation {
  get table() {
    return "role";
  }

  get multiTenantObject() {
    return false;
  }

  async favorite(body) {
    var updateBody = {
      favorite: body.favorite || false
    };
    if (!process.env.TESTING && ["staging", "production"].indexOf(process.env.NODE_ENV) > -1)
      await this.context.DynamoDB.table(process.env.NODE_ENV + "Audit")
        .where("account")
        .eq(this.context.account)
        .where("typeid")
        .eq(body.typeid)
        .update(updateBody);

    return this.query(
      body.typeid
        .replace("/")
        .slice(0, 2)
        .join("/")
    );
  }

  async query(body) {
    if (["staging", "production"].indexOf(process.env.NODE_ENV) == -1)
      return [
        {
          ownerName: "Roberto",
          action: "create",
          typeid: "12322",
          createdAt: "2019-11-11 11:33:33",
          delta:
            '{"estado":"archivado","monto":344596.89,"fechaIngreso":"2019-04-26 14:04:00","lineaPagoDocumento":"[]","updatedAt":"2019-04-26 14:04:00","updatedBy":"Roberto Rodriguez","consecutivo":1000236}'
        },
        {
          ownerName: "Roberto",
          action: "create",
          typeid: "12322",
          createdAt: "2019-11-11 11:33:33",
          delta:
            '{"estado":"archivado","monto":344596.89,"fechaIngreso":"2019-04-26 14:04:00","lineaPagoDocumento":"[]","updatedAt":"2019-04-26 14:04:00","updatedBy":"Roberto Rodriguez","consecutivo":1000236}'
        },
        {
          ownerName: "Roberto",
          action: "create",
          typeid: "12322",
          createdAt: "2019-11-11 11:33:33",
          delta:
            '{"estado":"archivado","monto":344596.89,"fechaIngreso":"2019-04-26 14:04:00","lineaPagoDocumento":"[]","updatedAt":"2019-04-26 14:04:00","updatedBy":"Roberto Rodriguez","consecutivo":1000236}'
        },
        {
          ownerName: "Roberto",
          action: "create",
          typeid: "12322",
          createdAt: "2019-11-11 11:33:33",
          delta:
            '{"estado":"archivado","monto":344596.89,"fechaIngreso":"2019-04-26 14:04:00","lineaPagoDocumento":"[]","updatedAt":"2019-04-26 14:04:00","updatedBy":"Roberto Rodriguez","consecutivo":1000236}'
        }
      ];

    return await this.context.DynamoDB.table(process.env.NODE_ENV + "Audit")
      .select("action", "createAt", "delta", "ownerName", "typeid", "createdAt")
      .where("account")
      .eq(this.context.account)
      .where("typeid")
      .begins_with(`${body.type}/${body.id}`)
      .descending()
      .consistent_read()
      .query();
  }
}

module.exports = Audit;
