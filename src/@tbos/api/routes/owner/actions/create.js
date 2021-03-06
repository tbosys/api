var BaseAction = rootRequire("@tbos/api/operation/baseCreateAction");
var Errors = rootRequire("@tbos/api/errors");

module.exports = class DefaultCreateAction extends BaseAction {
  async postCreate() {
    if (this._.profileOwner) {
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
