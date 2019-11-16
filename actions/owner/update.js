var BaseAction = require("../../operation/baseUpdateAction");
var Errors = require("../../errors");
var moment = require("moment-timezone");

module.exports = class DefaultCreateAction extends BaseAction {
  async postUpdate() {
    if (this._.profileOwner) {
      await this.knex
        .table("profileOwner")
        .delete()
        .where("ownerId", this.body.id);

      var items = this._.profileOwner.map(item => {
        delete item.id;
        return item;
      });

      var promisses = items.map(item => {
        return this.getActionAndInvoke("profileOwner", "create", item);
      });
      await Promise.all(promisses);
    }
    return true;
  }
};
