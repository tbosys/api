const Errors = require("../errors");
var moment = require("moment");

var BaseOperation = require("../operation/baseOperation");
var Parser = require("../apiHelpers/xmlParser");
var BodyHelper = require("../operation/bodyHelper");
var SendEmail = require("../apiHelpers/sendEmail");
var JWT = require("../apiHelpers/jwt");

var request = require("superagent");
var AWS = require("aws-sdk");
var lambda = new AWS.Lambda();
var knexMigrate = require("knex-migrate");

class ApiOperation extends BaseOperation {
  get table() {
    return "usuario";
  }

  get secure() {
    return false;
  }

  get multiTenantObject() {
    return true;
  }

  async token() {
    if (process.env.NODE_ENV == "production" || process.env.NODE_ENV == "staging") return {};
    const log = ({ action, migration }) => console.log("Doing " + action + " on " + migration);

    await knexMigrate("down", { to: 0 }, log);
    await knexMigrate("up", {}, log);
    await this.knex.seed.run();

    var user = await this.knex
      .table("usuario")
      .select("*")
      .where("name", "Sistema")
      .first();
    user.roles = user.roles ? user.roles.split(",") : [];

    user.timestamp = moment();

    return { authorization: JWT.encode(user) };
  }

  async login(body) {
    if (
      process.env.NODE_ENV == "dev" ||
      process.env.NODE_ENV == "development" ||
      process.env.NODE_ENV == "test"
    )
      return true;
    else throw new Error("Email no existe " + body.email);
  }

  async code(body) {
    var code;
    if (
      process.env.NODE_ENV == "dev" ||
      process.env.NODE_ENV == "development" ||
      process.env.NODE_ENV == "test"
    )
      code = { usuarioId: 1 };
    else throw new Error("Email no existe " + body.email);

    return {
      authorization: JWT.encode({
        id: 1,
        name: "Dev User",
        email: "devuser@efactura.io",
        roles: ["*_*"],
        profile: "base",
        timestamp: moment()
      })
    };
  }
}

module.exports = ApiOperation;
