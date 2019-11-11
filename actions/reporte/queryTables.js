var QueryAction = require("../../operation/baseQueryAction");
var Errors = require("../../errors");
var moment = require("moment-timezone");
var fs = require("fs");

module.exports = class RegistroRecentQuery extends QueryAction {
  async query(body) {
    var items = fs.readdirSync("./schema");
    return items.map(item => ({ id: item, name: item }));
  }
};
