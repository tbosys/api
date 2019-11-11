var BaseAction = require("../../operation/baseCreateAction");

module.exports = class DefaultCreateAction extends BaseAction {
  preValidate() {
    this.body.createdById = this.user.id;
    this.body.createdBy = this.user.name;
    this.body.isSection == 1 ? (this.body.isSection = true) : (this.body.isSection = false);
  }
};
