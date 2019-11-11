var BaseAction = require("../../operation/baseCreateAction");

var Errors = require("../../errors");
var BodyHelper = require("../../operation/bodyHelper");

var moment = require("moment-timezone");

module.exports = class DefaultUpdateAction extends BaseAction {

  execute(table, body) {
    this.table = table;
    this.body = body;
    return this.approve(table, body, current);
  }

  async aceptar(table, body) {
    try {
      var delta = { estado: "por aprobar" };

      await this.enforceStatus(body, ["por aceptar"]);

      var result = await this.knex.table(table).update().whereIn("id", body.ids);

      if (result.length == 0) throw new Errors.UPDATE_WITHOUT_RESULT(this.table, body.id);
      return result;
    } catch (e) {
      if (e.code == "ER_DUP_ENTRY") throw new Errors.DUPLICATE_ERROR(e, body);
      throw e;
    }
  }

}