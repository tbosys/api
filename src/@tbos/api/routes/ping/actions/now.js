var BaseAction = rootRequire("@tbos/api/operation/baseAction");
var Errors = rootRequire("@tbos/api/errors");

module.exports = class AprobarAction extends BaseAction {
  async execute(table, body) {
    return body;
  }
};
