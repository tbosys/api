const Errors = require("../errors");
var moment = require("moment");
let JWT = require("../apiHelpers/jwt");
var AWS = require("aws-sdk");
var request = require("superagent");
var BaseOperation = require("../operation/baseOperation");
var lambda = new AWS.Lambda();

class ApiOperation extends BaseOperation {
  constructor(context) {
    super(context);
    this.user = context.user;
  }

  get secure() {
    return false;
  }

  async slackTeam(body) {
    console.log(body);

    var host = "localhost%3A4001";
    var http = "http";
    if (this.context.headers.host.indexOf("localhost") == -1) {
      http = "https";
      host =
        body.state.indexOf("staging") > -1
          ? "staging.efactura.io"
          : "efactura.io";
    }

    var redirectUrl = `${http}%3A%2F%2F${host}%2Fapi%2Flogin%2Flogin%2Fslack`;

    var url = `https://slack.com/api/oauth.access?redirect_uri=${redirectUrl}&client_id=360520228309.584379146962&client_secret=db406fcb50413a5d61f06d4fd6fe376b&code=${body.code}`;

    var response = await request.get(url);

    console.log(response.body);
    if (!response.body.ok)
      throw new Errors.AUTH_ERROR("Error de Slack " + response.body.error);

    await this.context.DynamoDB.table(process.env.NODE_ENV + "Config")
      .where("account")
      .eq(account)
      .update({
        slack: response.body
      });

    return {
      statusCode: 303,
      body: "<h1>Success</h1>",
      headers: {
        "Content-Type": "text/html",
        Location: `${http}://${host
          .replace("4001", "3000")
          .replace("%3A", ":")}/home`
      }
    };
  }

  async slack(body) {
    console.log(body);
    if (body.state.indexOf("team") > -1) return this.slackTeam(body);
    var host = "localhost%3A4001";
    var http = "http";
    if (this.context.headers.host.indexOf("localhost") == -1) {
      http = "https";
      host =
        body.state.indexOf("staging") > -1
          ? "staging.efactura.io"
          : "efactura.io";
    }

    var redirectUrl = `${http}%3A%2F%2F${host}%2Fapi%2Flogin%2Flogin%2Fslack`;

    var url = `https://slack.com/api/oauth.access?redirect_uri=${redirectUrl}&client_id=360520228309.584379146962&client_secret=db406fcb50413a5d61f06d4fd6fe376b&code=${body.code}`;

    console.log(url);

    var response = await request.get(url);

    console.log(response.body);
    if (!response.body.ok)
      throw new Errors.AUTH_ERROR("Error de Slack " + response.body.error);

    var email = response.body.user.email;
    if (process.env.NODE_ENV == "development") email = "dev@dev";

    var users = await this.context.DynamoDB.table(
      process.env.NODE_ENV + "Usuario"
    )
      .index("emailSolo")
      .select("id", "account", "name", "email", "roles", "activo", "nivel")
      .where("email")
      .eq(email)
      .query();
    let user = users[0];
    if (!user) throw new Errors.ITEM_NOT_FOUND("Email", email);
    delete user.roles;
    user.timestamp = moment().toISOString();

    await this.context.DynamoDB.table(process.env.NODE_ENV + "Usuario")
      .where("account")
      .eq(user.account)
      .where("id")
      .eq(user.id)
      .update({
        avatar: response.body.user.image_72,
        slack: { id: response.body.user.id, token: response.body.access_token }
      });

    var encoded = JWT.encode(user);
    return {
      statusCode: 303,
      body: "<h1>Success</h1>",
      headers: {
        "Content-Type": "text/html",
        Location: `${http}://${host
          .replace("4001", "3000")
          .replace("%3A", ":")}/home?account=${user.account}&code=${encoded}`
      }
    };
  }

  async userExists(body) {
    if (!body.email)
      throw new Errors.VALIDATION_ERROR("Email field is required");

    var users = await this.context.DynamoDB.table(
      process.env.NODE_ENV + "Usuario"
    )
      .select("id")
      .index("emailSolo")
      .where("email")
      .eq(body.email)
      .query();

    return { exists: users.length > 0 };
  }

  async login(body) {
    var code = parseInt(Math.random() * 10000) + "";
    if (process.env.NODE_ENV == "development" || process.env.NODE_ENV == "test")
      code = 1111;

    if (!body.email)
      throw new Errors.VALIDATION_ERROR("Email field is required");

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
    if (!body.code) throw new Errors.VALIDATION_ERROR("Code is required");
    if (!body.email) throw new Errors.VALIDATION_ERROR("Email is required");

    const code = await this.context.knex
      .table("code")
      .select("id")
      .where("code", body.code)
      .first();

    if (!code) throw new Error("Code not found");
    if (moment(code.createdAt).diff(moment(), "seconds") > 100)
      throw new Errors.ITEM_NOT_FOUND(
        "Code has expired, we'll send you a new one"
      );

    await this.context.knex
      .table("code")
      .del()
      .where("code", body.code)
      .where("email", body.email);

    var user = await this.context.knex
      .table("owner")
      .where("email", body.email)
      .first();

    if (!user) throw new Errors.ITEM_NOT_FOUND("Code", body.code);

    user.timestamp = moment().toISOString();

    return { authorization: JWT.encode(user) };
  }

  async loginAs(body) {
    if (!body.id) throw new Errors.VALIDATION_ERROR(`User Id can't be empty`);

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

  async getToken(body) {
    if (process.env.NODE_ENV != "development")
      throw new Error("No es development");
    return { authorization: JWT.encode({ namespaceId: process.env.NODE_ENV }) };
  }
}

module.exports = ApiOperation;
