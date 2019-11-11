var BaseAction = require("./baseAction");
var Errors = require("../errors");
var moment = require("moment-timezone");
var Security = require("../apiHelpers/security");

module.exports = class DefaultUpdateAction extends BaseAction {
  get secure() {
    return false;
  }

  set secure(isSecure) {}

  execute(table, body) {
    this.table = table;
    this.body = body;
    this.metadata = this.getMetadata(this.table);

    return this.query(body);
  }

  async query(body) {
    Promise.resolve([]);
  }
};
