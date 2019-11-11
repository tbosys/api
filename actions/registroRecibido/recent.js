var QueryAction = require("../../operation/baseQueryAction");
var Errors = require("../../errors");
var moment = require("moment-timezone");

module.exports = class RegistroRecentQuery extends QueryAction {

  async query(body) {

    return await this.knex("registroElectronico").select()
      .whereIn("tipo", ["documento", "documento pendiente"])
      .orderBy("createdAt", "DESC")
      .limit(100)

  }

}
