var QueryAction = require("../../operation/baseQueryAction");
var Errors = require("../../errors");
var moment = require("moment-timezone");

module.exports = class RegistroRecentQuery extends QueryAction {
  get secure() {
    return false;
  }
  async query(body) {
    return await this.knex("cliente")
      .select()
      .where("name", "like", `%${body.name}%`)
      .limit(10);
  }
};
