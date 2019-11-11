var BaseAction = require("../../operation/baseAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");

var moment = require("moment-timezone");

module.exports = class DefaultUpdateAction extends BaseAction {
  async execute(table, body) {
    this.table = table;
    this.body = body;

    await this.enforceStatus(body, ["por entregar"]);

    await this.knex.table(this.table)
    .update({ estado: "archivado" , fechaEntrega: moment().format("YYYY-MM-DD"),})
    .whereIn("despacho.id", this.body.ids);
    return true;
  }
};
