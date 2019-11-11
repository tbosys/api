const Errors = require("../errors");

var BaseOperation = require("../operation/baseOperation");
var Parser = require("../apiHelpers/xmlParser");
var BodyHelper = require("../operation/bodyHelper");
const AWS = require("aws-sdk");
var Promise = require("bluebird");
var RequireAll = require("require-all");
const PATH = require("path");
const dirTree = require("directory-tree");
const moment = require("moment");
const s3 = new AWS.S3({
  signatureVersion: "v4"
});

class Note extends BaseOperation {
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
      await this.context.DynamoDB.table(process.env.NODE_ENV + "Nota")
        .where("account")
        .eq(this.context.account)
        .where("typeid")
        .eq(body.typeid)
        .update(updateBody);

    return this.query(
      body.typeid
        .split("/")
        .slice(0, 2)
        .join("/")
    );
  }

  async create(body) {
    var insert = {
      ...body,
      account: this.context.account,
      ownerId: this.context.user.id,
      ownerName: this.context.user.name,
      typeid: body.type + "/" + body.id + "/" + moment().format("YYYY-MM-DD-HH-MM--ss-SSS")
    };
    if (!process.env.TESTING && ["staging", "production"].indexOf(process.env.NODE_ENV) > -1)
      await this.context.DynamoDB.table(process.env.NODE_ENV + "Nota").insert(insert);
    return insert;
  }

  async query(body) {
    if (["staging", "production"].indexOf(process.env.NODE_ENV) == -1)
      return [
        {
          ownerName: "Lop Roep",
          message: "dsds dsd dsd sd sdsddssd  sdssd sdsd ddssd sdsds dsdsd dsds",
          title: "TITLE dsd sdsd",
          typeid: "1",
          createdAt: "2019-3-3"
        },
        {
          ownerName: "Roberto Artavia",
          message: "dsds dsd dsdj j jsdsdkjsd sdjksdjd sdjkdjk sdjjsk s djksdjkds  dkjdsjksdjksd",
          title: "TITLE dsd sdsd",
          typeid: "1",
          createdAt: "2019-3-3"
        }
      ];
    return await this.context.DynamoDB.table(process.env.NODE_ENV + "Nota")
      .select("message", "ownerName", "type", "typeid", "createdAt")
      .where("account")
      .eq(this.context.account)
      .where("typeid")
      .begins_with(`${body.type}/${body.id}`)
      .descending()
      .query();
  }
}

module.exports = Note;
