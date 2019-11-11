var QueryAction = require("../../operation/baseQueryAction");
var Errors = require("../../errors");
var moment = require("moment-timezone");

module.exports = class RegistroRecentQuery extends QueryAction {

  async query(body) {

    return await this.knex("registroElectronico").select()
      .orderBy("createdAt", "DESC")
      .limit(100)

  }

}
