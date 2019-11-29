var BaseAction = rootRequire("@tbos/api/operation/baseAction");
var Errors = rootRequire("@tbos/api/errors");

module.exports = class AprobarAction extends BaseAction {
  async execute(table, body) {
    var results = await this.getActionAndInvoke(table, "bulkUpdate", {
      items: body.ids.map(id => ({ id: id, status: "por imprimir" }))
    });
    return results;
  }
};
