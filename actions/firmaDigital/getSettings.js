var QueryAction = require("../../operation/baseQueryAction");
var Errors = require("../../errors");
var moment = require("moment-timezone");

module.exports = class PagoCreateAction extends QueryAction {
  async query(body) {
    return {};
  }
};
