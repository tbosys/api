var BaseAction = require("./baseAction");
var Errors = require("../errors");
var moment = require("moment-timezone");
var Security = require("../apiHelpers/security");

module.exports = class DefaultUpdateAction extends BaseAction {
  async execute(table, body) {
    var promises = body.items.map(item => {
      return this.getActionAndInvoke(table, "update", item);
    });
    return Promise.all(promises);
  }
};
