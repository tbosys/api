var QueryAction = require("../../operation/baseQueryAction");
var Errors = require("../../errors");
var moment = require("moment-timezone");

module.exports = class DistritoQuery extends QueryAction {

  findLikeName(body) {
    var results = await this.knex("distrito").select().where("name", "LIKE", `%${body.name}%`)
    return results.map(function (item) {
      item.name = item.name.toLowerCase();
      item.fullName = (`${item.provincia} ${item.canton}`).toLowerCase();
      return item;
    })
  }
}
