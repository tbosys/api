var BaseAction = require("../../operation/baseUpdateAction");

module.exports = class DefaultCreateAction extends BaseAction {
  preValidate() {
    this.body.isSection == 1 ? (this.body.isSection = true) : (this.body.isSection = false);
  }
};
