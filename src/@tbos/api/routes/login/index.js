const Errors = rootRequire("@tbos/api/errors");
var moment = require("moment");
let JWT = rootRequire("@tbos/api/apiHelpers/jwt");
var AWS = require("aws-sdk");
var request = require("superagent");
var BaseOperation = rootRequire("@tbos/api/operation/baseOperation");
var lambda = new AWS.Lambda();

class ApiOperation extends BaseOperation {
  constructor(context) {
    super(context);
    this.user = context.user;
  }

  get secure() {
    return false;
  }

  async login(body) {
    var code = parseInt(Math.random() * 10000) + "";
    if (process.env.NODE_ENV == "development" || process.env.NODE_ENV == "test")
      code = 1111;

    if (!body.email) throw new Errors.VALIDATION_ERROR(["Email"]);

    var user = await this.context.knex
      .table("owner")
      .select("id", "name", "email")
      .where("email", body.email)
      .first();

    if (!user) throw new Error(`Email not found ${body.email}`);

    await this.context.knex.table("code").insert({
      code: code,
      email: body.email
    });

    if (process.env.NODE_ENV == "development" || process.env.NODE_ENV == "test")
      return { success: true };

    var params = {
      FunctionName: `emails-${process.env.NODE_ENV}-login`,
      InvokeArgs: JSON.stringify({
        contactos: [
          {
            contacto: { email: user.email, name: user.name },
            cliente: {},
            metadata: { code: code }
          }
        ],
        metadataType: "usuario"
      })
    };
    await lambda.invokeAsync(params).promise();
    return {
      success: true,
      code:
        ["test", "development"].indexOf(process.env.NODE_ENV) > -1 ? code : ""
    };
  }

  async code(body) {
    if (!body.code) throw new Errors.VALIDATION_ERROR(["code"]);
    if (!body.email) throw new Errors.VALIDATION_ERROR(["email"]);

    const code = await this.context.knex
      .table("code")
      .select("id")
      .where("code", body.code)
      .first();

    if (!code) throw new Error("Code not found");
    if (moment(code.createdAt).diff(moment(), "seconds") > 100)
      throw new Errors.ITEM_NOT_FOUND("owner", "code");

    await this.context.knex
      .table("code")
      .del()
      .where("code", body.code)
      .where("email", body.email);

    var user = await this.context.knex
      .table("owner")
      .where("email", body.email)
      .first();

    if (!user) throw new Errors.ITEM_NOT_FOUND("owner", "email");

    user.timestamp = moment().toISOString();

    return { authorization: JWT.encode(user) };
  }

  async loginAs(body) {
    if (!body.id) throw new Errors.VALIDATION_ERROR(["id"]);

    if (this.user.roles.indexOf("*_*") == -1)
      throw new Error("Admin permission not found on current user");

    var user = await this.context.knex
      .table("usuario")
      .where("id", body.id)
      .first();

    var code = parseInt(Math.random() * 1000);
    await this.context.knex.table("code").insert({
      code: code + "",
      email: this.user.email
    });

    user.timestamp = moment().toISOString();

    return { authorization: JWT.encode(user), code: code };
  }

  async getToken() {
    if (process.env.NODE_ENV != "development")
      throw new Errors.SERVER_ERROR("Only valid in development");
    return { authorization: JWT.encode({ namespaceId: process.env.NODE_ENV }) };
  }
}

module.exports = ApiOperation;
