var BaseAction = require("../../operation/baseCreateAction");
var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");

var moment = require("moment-timezone");

module.exports = class DefaultUpdateAction extends BaseAction {

  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.esperar(table, body);
  }

  async esperar(table, body) {

    var id = this.enforceSingleId(body);

    await this.enforceStatus(body, ["por aprobar"]);

    var delta = { estado: "por reactivar" };

    var result = await this.knex.table(table).update(delta).where("id", id);

    if (result.length == 0) throw new Errors.UPDATE_WITHOUT_RESULT(this.table, id);
    return result;

  }

}